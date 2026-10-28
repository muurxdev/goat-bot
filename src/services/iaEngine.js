/**
 * Motor de IA do GOAT — Roteamento inteligente, respostas naturais e sem disclaimers
 */

const logger = require('../core/logger')

const CACHE_TTL_MS = 30 * 60 * 1000   // 30 min
const CACHE_MAX = 300
const _cache = new Map()               // chave -> { resposta, at }

function _cacheGet(chave) {
    const hit = _cache.get(chave)
    if (!hit) return null
    if (Date.now() - hit.at > CACHE_TTL_MS) { _cache.delete(chave); return null }
    _cache.delete(chave); _cache.set(chave, hit)
    return hit.resposta
}

function _cacheSet(chave, resposta) {
    if (_cache.size >= CACHE_MAX) _cache.delete(_cache.keys().next().value)
    _cache.set(chave, { resposta, at: Date.now() })
}

const _norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/**
 * Descobre a intenção do usuário para responder da forma mais adequada e natural.
 * @returns {'conta'|'traducao'|'resumo'|'conversa'|'factual'}
 */
function detectarIntencao(pergunta) {
    const p = _norm(pergunta)
    if (/^[\d\s+\-*/%^().,]+$/.test(p) && /[\d]/.test(p)) return 'conta'
    if (/^(traduz|traduza|traduzir|translate)\b/.test(p)) return 'traducao'
    if (/^(resuma|resumir|resumo de)\b/.test(p)) return 'resumo'

    // Saudações e papo cotidiano
    if (/^(oi|ola|olá|e\s*ai|fala\s*ai|salve|bom\s*dia|boa\s*tarde|boa\s*noite|opa|hey|hello)\b/.test(p)) return 'conversa'
    if (/^(como\s*(vai|esta|estas|voce\s*(esta|ta|vai)|vc\s*(esta|ta|vai))|tudo\s*bem|beleza|tranquilo|td\s*bem)\b/.test(p)) return 'conversa'
    if (/^(quem\s*(e|eh)\s*(voce|vc)|o\s*que\s*voce\s*faz|qual\s*o\s*seu\s*nome|apresente-se)\b/.test(p)) return 'conversa'
    if (/^(valeu|obrigado|obrigada|obg|agradeco|tmj|tamo\s*junto)\b/.test(p)) return 'conversa'
    if (/^(conta\s*(uma\s*)?piada|me\s*faz\s*rir|manda\s*uma\s*piada)\b/.test(p)) return 'conversa'

    return 'factual'
}

/** Avalia expressão aritmética simples com segurança (sem eval). */
function calcular(expr) {
    const limpo = String(expr).replace(/[^0-9+\-*/%^().,\s]/g, '').replace(/,/g, '.').replace(/\^/g, '**')
    if (!limpo.trim()) return null
    try {
        const r = Function(`"use strict"; return (${limpo})`)()
        return Number.isFinite(r) ? r : null
    } catch (_) { return null }
}

const { getBotName } = require('../config/botConfig')

const RESPOSTAS_CONVERSA = {
    saudacao: [
        'Fala aí! Tudo na paz? Eu sou o GOAT! Como posso te ajudar hoje?',
        'Opa! Tudo certo? GOAT na área! Pode mandar a dúvida ou o que você precisa.',
        'E aí! Tudo bem por aí? Sou o GOAT. Se precisar de alguma informação, download ou ajuda, só falar!'
    ],
    bem_estar: [
        'Tudo 100% por aqui, com energia máxima e pronto pra jogar junto! E com você, como estão as coisas?',
        'Tudo tranquilo por aqui! Sempre pronto pra resolver qualquer parada. O que manda hoje?',
        'Por aqui tá tudo excelente! Espero que seu dia esteja sendo produtivo. Como posso te ajudar agora?'
    ],
    quem_e: [
        'Eu sou o GOAT! Um assistente inteligente e completo para o WhatsApp: tiro dúvidas, pesquiso na web, baixo mídias na melhor qualidade, gerencio grupos, comando um super RPG, economia e muito mais. Digite .menu para ver todos os comandos!',
        'Prazer! Sou o GOAT, seu bot aqui no WhatsApp. Posso te ajudar com perguntas, pesquisas, downloads de músicas e vídeos, jogos e utilidades. No que posso ser útil agora?'
    ],
    agradecimento: [
        'Tmj sempre! Se precisar de mais alguma coisa, só chamar.',
        'Valeu você! Qualquer coisa, tô sempre por aqui.',
        'De nada! Se pintar mais alguma dúvida, manda a boa!'
    ],
    piada: [
        'Por que o livro de matemática se suicidou? Porque tinha muitos problemas! 😂',
        'O que o pato falou para a pata? Vem Quá! 🦆😂',
        'O que o zero disse para o oito? Belo cinto! 😆',
        'Qual é o cúmulo da força? Dobrar a esquina! 🤣'
    ]
}

function responderConversaFallback(pergunta) {
    const p = _norm(pergunta)
    let lista = RESPOSTAS_CONVERSA.saudacao

    if (/tudo\s*bem|como\s*(vai|voce|vc)|beleza|tranquilo/.test(p)) {
        lista = RESPOSTAS_CONVERSA.bem_estar
    } else if (/quem\s*(e|eh)|o\s*que\s*voce\s*faz|nome|apresente/.test(p)) {
        lista = RESPOSTAS_CONVERSA.quem_e
    } else if (/valeu|obrigad|obg|tmj/.test(p)) {
        lista = RESPOSTAS_CONVERSA.agradecimento
    } else if (/piada|rir/.test(p)) {
        lista = RESPOSTAS_CONVERSA.piada
    }

    const idx = Math.floor(Math.random() * lista.length)
    return lista[idx]
}

function extrairTopico(pergunta) {
    return String(pergunta || '')
        .replace(/^(quem\s+(foi|e|eh|é|era|sao|são)|o\s+que\s+(e|eh|é|foi|era|significa)|qual\s+(a\s+|o\s+)?(historia|origem|significado)\s+d[eao]?|historia\s+d[eao]|tudo\s+sobre|como\s+funciona|onde\s+fica)\s+/i, '')
        .replace(/[?!.]+$/, '')
        .trim()
}

/** Limpa e formata snippets de busca para soarem naturais */
function sintetizarSnippets(snippets = []) {
    if (!snippets.length) return ''
    const textos = snippets
        .map(s => String(s || '').trim())
        .filter(Boolean)
        // Ignora trechos de sumário / índices numéricos como "2.1Alpinismo..."
        .filter(s => !/^\d+(\.\d+)*[A-Za-zÀ-ÿ]/.test(s))
        // Remove datas de publicação cruas no início ("14 de mar. de 1879 — ...")
        .map(s => s.replace(/^\d{1,2}\s+de\s+[a-zçã]+\.?\s+de\s+\d{4}\s*[-—–:]\s*/i, ''))
        // Remove reticências soltas
        .map(s => s.replace(/\s*\.\.\.\s*$/g, '.').replace(/\s*\.\.\.\s*/g, ' '))
        .map(s => s.trim())
        .filter(s => s.length > 25 && s.includes(' '))

    if (!textos.length) return ''
    const principal = textos[0]
    // Se a frase não termina com pontuação, fecha com ponto final
    return principal.endsWith('.') || principal.endsWith('!') || principal.endsWith('?')
        ? principal
        : principal + '.'
}

/**
 * Responde uma pergunta factual de forma natural, sem expor fontes ou motores.
 * @param {string} pergunta
 * @returns {Promise<{texto:string, doCache:boolean}|null>}
 */
async function responderFactual(pergunta) {
    const chave = 'f:' + _norm(pergunta)
    const emCache = _cacheGet(chave)
    if (emCache) return { texto: emCache.texto, doCache: true }

    const { searchWeb, searchWiki } = require('./aiService')
    const llm = require('./llmService')

    // 0. Claude é o motor: ele mesmo pesquisa na web e responde. O caminho local abaixo (Wikipédia,
    // raspagem do DuckDuckGo, junção de trechos) só existe para quando NÃO há chave configurada.
    if (llm.claudeAtivo()) {
        try {
            const r = await llm.pesquisar(pergunta)
            if (r && r.text && r.text.trim()) {
                let texto = r.text.trim()
                if (r.sources.length) {
                    texto += '\n\n📎 *Fontes:*\n' + r.sources.slice(0, 3).map(s => `• ${s.title}\n  ${s.url}`).join('\n')
                }
                const saida = { texto }
                _cacheSet(chave, saida)
                return { ...saida, doCache: false }
            }
        } catch (e) {
            logger.warn(`[IA ENGINE] Pesquisa pelo Claude falhou: ${e.message}`)
        }
        return {
            texto: 'Não consegui pesquisar isso agora. Tente de novo em instantes.',
            doCache: false
        }
    }

    // 1. Se houver provedor LLM configurado, usa inteligência em nuvem
    if (llm.hasProvider()) {
        try {
            // Tenta resposta direta do LLM
            const respDireta = await llm.ask(pergunta)
            if (respDireta && respDireta.trim().length >= 10) {
                const saida = { texto: respDireta.trim() }
                _cacheSet(chave, saida)
                return { ...saida, doCache: false }
            }
        } catch (e) {
            logger.warn(`[IA ENGINE] LLM falhou: ${e.message}`)
        }
    }

    const topico = extrairTopico(pergunta)

    // 2. Busca enciclopédica na Wikipédia oficial em português
    try {
        let wikiRes = await searchWiki(topico)
        if (!wikiRes || !wikiRes.extract) {
            wikiRes = await searchWiki(pergunta)
        }
        if (wikiRes && wikiRes.extract && wikiRes.extract.trim().length >= 30) {
            let texto = wikiRes.extract.trim()
            if (llm.hasProvider()) {
                // Sintetiza com tom humanizado
                const sint = await llm.askComContexto(pergunta, [{ title: wikiRes.title, snippet: texto }])
                if (sint) texto = sint
            }
            const saida = { texto }
            _cacheSet(chave, saida)
            return { ...saida, doCache: false }
        }
    } catch (errIgnorado) { logger.warn(`[IAENGINE] Falha ignorada em src/services/iaEngine.js:179: ${errIgnorado.message}`) }

    // 3. Busca web via DuckDuckGo / OpenSearch
    let fontes = []
    try {
        fontes = (await searchWeb(pergunta)) || []
    } catch (e) {
        logger.warn(`[IA ENGINE] Busca falhou: ${e.message}`)
    }

    if (fontes.length > 0) {
        if (llm.hasProvider()) {
            try {
                const sintese = await llm.askComContexto(pergunta, fontes)
                if (sintese && sintese.trim()) {
                    const saida = { texto: sintese.trim() }
                    _cacheSet(chave, saida)
                    return { ...saida, doCache: false }
                }
            } catch (errIgnorado) { logger.warn(`[IAENGINE] Falha ignorada em src/services/iaEngine.js:198: ${errIgnorado.message}`) }
        }

        const textoSintetizado = sintetizarSnippets(fontes.map(f => f.snippet))
        if (textoSintetizado) {
            const saida = { texto: textoSintetizado }
            _cacheSet(chave, saida)
            return { ...saida, doCache: false }
        }
    }

    return {
        texto: 'Não consegui encontrar detalhes suficientes sobre isso no momento. Tente reformular a pergunta de forma mais direta!',
        doCache: false
    }
}

/**
 * Ponto de entrada único do .ia — roteia e devolve a resposta pronta e limpa.
 * @param {string} pergunta
 * @returns {Promise<{texto:string, doCache:boolean}>}
 */
async function responder(pergunta) {
    const q = String(pergunta || '').trim()
    if (!q) return { texto: 'Envie sua dúvida ou o que você deseja pesquisar.', doCache: false }

    const intencao = detectarIntencao(q)

    // A. Cálculo aritmético
    if (intencao === 'conta') {
        const r = calcular(q)
        if (r !== null) {
            return { texto: `*Resultado:* ${q.trim()} = *${r.toLocaleString('pt-BR')}*`, doCache: false }
        }
    }

    const llm = require('./llmService')

    // B. Conversas cotidianas, cumprimentos e humor
    if (intencao === 'conversa') {
        if (llm.hasProvider()) {
            try {
                const r = await llm.ask(q)
                if (r && r.trim()) return { texto: r.trim(), doCache: false }
            } catch (errIgnorado) { logger.warn(`[IAENGINE] Falha ignorada em src/services/iaEngine.js:242: ${errIgnorado.message}`) }
        }
        return { texto: responderConversaFallback(q), doCache: false }
    }

    // C. Tradução
    if (intencao === 'traducao') {
        const alvo = q.replace(/^(traduz(a|ir)?|translate)\s*/i, '')
        if (llm.hasProvider()) {
            const r = await llm.traduzir(alvo)
            if (r) return { texto: r, doCache: false }
        }
        return { texto: `Tradução: ${alvo}`, doCache: false }
    }

    // D. Resumo
    if (intencao === 'resumo') {
        const alvo = q.replace(/^(resuma|resumir|resumo de)\s*/i, '')
        if (llm.hasProvider()) {
            const r = await llm.resumir(alvo)
            if (r) return { texto: r, doCache: false }
        }
        return { texto: alvo.length > 200 ? alvo.slice(0, 200) + '...' : alvo, doCache: false }
    }

    // E. Consulta factual
    const factual = await responderFactual(q)
    return factual || { texto: 'Não consegui obter respostas para isso no momento. Tente novamente em instantes.', doCache: false }
}

/** Rótulo limpo do motor */
function motorAtual() {
    const llm = require('./llmService')
    const ativos = llm.providersAtivos()
    return ativos.length ? ativos[0] : 'GOAT AI'
}

function limparCache() { _cache.clear() }

module.exports = { responder, responderFactual, detectarIntencao, calcular, motorAtual, limparCache }
