/**
 * DIVULGAÇÃO — campanhas, afiliação e alcance.
 *
 * A seção existia com quatro comandos que só disparavam texto: mandava o
 * anúncio e acabava ali. Nada dizia para quantas pessoas foi, o que já tinha
 * sido anunciado, quem trouxe quem, ou se valeu a pena.
 *
 * Este serviço guarda o que faltava — campanhas, indicações e histórico — e
 * calcula alcance a partir dos grupos reais em que o bot está, não de número
 * inventado.
 *
 * Tudo por escopo em `profile_data`: a campanha de um grupo não polui o outro.
 */

const { q } = require('../database/connection')
const perfilData = require('./profileDataService')
const logger = require('../core/logger')

const CHAVE_CAMPANHAS = 'divulgacao_campanhas'
const CHAVE_INDICACOES = 'divulgacao_indicacoes'
const CHAVE_HISTORICO = 'divulgacao_historico'

/** Quantas campanhas e envios ficam guardados por escopo. */
const TETO_CAMPANHAS = 50
const TETO_HISTORICO = 200

/** Situações de uma campanha. */
const SITUACOES = {
    rascunho: { emoji: '📝', nome: 'Rascunho' },
    ativa: { emoji: '🟢', nome: 'Ativa' },
    pausada: { emoji: '⏸️', nome: 'Pausada' },
    encerrada: { emoji: '🏁', nome: 'Encerrada' }
}

/** Formatos de peça, com a orientação de tamanho de cada um. */
const FORMATOS = {
    anuncio: { nome: 'Anúncio', limite: 700, dica: 'Uma ideia só. Quem lê no grupo não rola a tela.' },
    convite: { nome: 'Convite', limite: 400, dica: 'O que é, quando é, e o link. Nada mais.' },
    promocao: { nome: 'Promoção', limite: 500, dica: 'Comece pelo desconto, não pela história da empresa.' },
    parceria: { nome: 'Parceria', limite: 800, dica: 'Diga o que o outro lado ganha antes do que você ganha.' },
    recrutamento: { nome: 'Recrutamento', limite: 900, dica: 'Requisito e benefício. Quem se encaixa se identifica sozinho.' },
    lembrete: { nome: 'Lembrete', limite: 250, dica: 'Curto. Lembrete longo vira anúncio ignorado.' }
}

function escopoDe(jid) {
    return String(jid || 'global')
}

function ler(escopo, chave, padrao) {
    try {
        const bruto = perfilData.getData(escopoDe(escopo), chave, null)
        if (!bruto) return padrao
        const dados = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        return dados ?? padrao
    } catch (err) {
        logger.warn(`[DIVULGACAO] ${chave} de ${escopo} ilegível: ${err.message}`)
        return padrao
    }
}

function gravar(escopo, chave, valor) {
    try {
        perfilData.setData(escopoDe(escopo), chave, JSON.stringify(valor))
        return true
    } catch (err) {
        logger.error(`[DIVULGACAO] Falha ao gravar ${chave} em ${escopo}: ${err.message}`)
        return false
    }
}

// ══════════════════════════════════════════════════════════════
// CAMPANHAS
// ══════════════════════════════════════════════════════════════

function campanhas(escopo) {
    const lista = ler(escopo, CHAVE_CAMPANHAS, [])
    return Array.isArray(lista) ? lista : []
}

function acharCampanha(escopo, referencia) {
    const t = String(referencia || '').toLowerCase().trim()
    if (!t) return null
    const lista = campanhas(escopo)
    const indice = parseInt(t, 10)
    if (indice && lista[indice - 1]) return { campanha: lista[indice - 1], indice: indice - 1 }
    const pos = lista.findIndex(c => String(c.nome).toLowerCase().includes(t))
    return pos >= 0 ? { campanha: lista[pos], indice: pos } : null
}

function criarCampanha(escopo, { nome, formato = 'anuncio', texto = '', autor = null }) {
    const n = String(nome || '').trim()
    if (!n) return { ok: false, erro: 'Informe o nome da campanha.' }
    if (n.length > 60) return { ok: false, erro: 'O nome aceita até 60 caracteres.' }
    if (!FORMATOS[formato]) return { ok: false, erro: `Formato inválido. Use: ${Object.keys(FORMATOS).join(', ')}` }

    const lista = campanhas(escopo)
    if (lista.length >= TETO_CAMPANHAS) return { ok: false, erro: `Já existem ${TETO_CAMPANHAS} campanhas neste ambiente.` }
    if (lista.some(c => String(c.nome).toLowerCase() === n.toLowerCase())) {
        return { ok: false, erro: 'Já existe uma campanha com esse nome.' }
    }

    const campanha = {
        nome: n,
        formato,
        texto: String(texto || '').slice(0, 3000),
        situacao: 'rascunho',
        autor,
        criadaEm: Date.now(),
        envios: 0,
        alcance: 0,
        cliques: 0
    }
    lista.push(campanha)
    gravar(escopo, CHAVE_CAMPANHAS, lista)
    return { ok: true, campanha, posicao: lista.length }
}

function atualizarCampanha(escopo, referencia, mudancas) {
    const achado = acharCampanha(escopo, referencia)
    if (!achado) return { ok: false, erro: 'Campanha não encontrada.' }

    const permitidas = new Set(['texto', 'formato', 'situacao', 'nome'])
    const lista = campanhas(escopo)
    for (const [k, v] of Object.entries(mudancas || {})) {
        if (!permitidas.has(k)) {
            logger.warn(`[DIVULGACAO] Campo "${k}" não pode ser alterado — ignorado.`)
            continue
        }
        if (k === 'situacao' && !SITUACOES[v]) return { ok: false, erro: `Situação inválida. Use: ${Object.keys(SITUACOES).join(', ')}` }
        if (k === 'formato' && !FORMATOS[v]) return { ok: false, erro: `Formato inválido. Use: ${Object.keys(FORMATOS).join(', ')}` }
        lista[achado.indice][k] = v
    }
    gravar(escopo, CHAVE_CAMPANHAS, lista)
    return { ok: true, campanha: lista[achado.indice] }
}

function removerCampanha(escopo, referencia) {
    const achado = acharCampanha(escopo, referencia)
    if (!achado) return { ok: false, erro: 'Campanha não encontrada.' }
    const lista = campanhas(escopo)
    lista.splice(achado.indice, 1)
    gravar(escopo, CHAVE_CAMPANHAS, lista)
    return { ok: true, campanha: achado.campanha }
}

/** Registra um disparo, somando o alcance estimado. */
function registrarEnvio(escopo, referencia, { grupos = 0, pessoas = 0 }) {
    const achado = acharCampanha(escopo, referencia)
    if (!achado) return { ok: false, erro: 'Campanha não encontrada.' }
    const lista = campanhas(escopo)
    const c = lista[achado.indice]
    c.envios = (c.envios || 0) + 1
    c.alcance = (c.alcance || 0) + Math.max(0, Number(pessoas) || 0)
    c.ultimoEnvio = Date.now()
    if (c.situacao === 'rascunho') c.situacao = 'ativa'
    gravar(escopo, CHAVE_CAMPANHAS, lista)

    const hist = historico(escopo)
    hist.unshift({ em: Date.now(), campanha: c.nome, grupos, pessoas })
    gravar(escopo, CHAVE_HISTORICO, hist.slice(0, TETO_HISTORICO))

    return { ok: true, campanha: c }
}

function historico(escopo) {
    const lista = ler(escopo, CHAVE_HISTORICO, [])
    return Array.isArray(lista) ? lista : []
}

// ══════════════════════════════════════════════════════════════
// ALCANCE
// ══════════════════════════════════════════════════════════════

/**
 * Alcance possível a partir dos grupos reais em que o bot atua.
 *
 * Lê os aluguéis ativos e os ambientes configurados — é o número honesto de
 * "para quantos lugares dá para falar", em vez de um total inventado.
 */
function alcancePotencial() {
    try {
        const ativos = q(`SELECT group_jid, group_name FROM rentals WHERE is_active = 1`).all()
        const ambientes = q(`SELECT group_jid FROM configs WHERE group_jid LIKE '%@g.us'`).all()
        const jids = new Set([...ativos.map(r => r.group_jid), ...ambientes.map(a => a.group_jid)].filter(Boolean))

        // Pessoas conhecidas com atividade recente servem de piso para a
        // estimativa: é gente que o bot realmente viu falando.
        const pessoas = q(`SELECT COUNT(*) AS n FROM users WHERE COALESCE(messages, 0) > 0`).get()?.n || 0

        return {
            grupos: jids.size,
            alugueisAtivos: ativos.length,
            pessoasConhecidas: pessoas,
            nomes: ativos.map(r => r.group_name).filter(Boolean).slice(0, 20)
        }
    } catch (err) {
        logger.warn(`[DIVULGACAO] Alcance potencial falhou: ${err.message}`)
        return { grupos: 0, alugueisAtivos: 0, pessoasConhecidas: 0, nomes: [] }
    }
}

/** Horários em que o grupo mais fala, para escolher quando anunciar. */
function melhoresHorarios(grupoJid) {
    try {
        // Sem histórico por hora no banco, a recomendação vem de padrão de uso
        // de grupo — e o texto diz que é orientação, não medição.
        return [
            { faixa: '08:00–10:00', nota: 'Começo do dia: boa leitura, pouca conversa' },
            { faixa: '12:00–14:00', nota: 'Almoço: pico de gente olhando o celular' },
            { faixa: '19:00–22:00', nota: 'Noite: maior movimento e mais respostas' }
        ]
    } catch (err) {
        logger.warn(`[DIVULGACAO] Horários falharam: ${err.message}`)
        return []
    }
}

// ══════════════════════════════════════════════════════════════
// INDICAÇÕES
// ══════════════════════════════════════════════════════════════

function indicacoes(escopo) {
    const dados = ler(escopo, CHAVE_INDICACOES, {})
    return dados && typeof dados === 'object' ? dados : {}
}

/** Código de indicação de alguém, criado na primeira consulta. */
function codigoDe(escopo, jid) {
    const dados = indicacoes(escopo)
    const numero = String(jid || '').split('@')[0]
    if (dados[numero]?.codigo) return dados[numero]

    // Código curto derivado do número: estável, sem precisar sortear e guardar.
    let h = 0
    for (let i = 0; i < numero.length; i++) h = (Math.imul(h, 31) + numero.charCodeAt(i)) | 0
    const codigo = Math.abs(h).toString(36).toUpperCase().slice(0, 6).padEnd(6, 'X')

    dados[numero] = { codigo, jid, indicados: [], criadoEm: Date.now() }
    gravar(escopo, CHAVE_INDICACOES, dados)
    return dados[numero]
}

/** Registra que alguém entrou por um código. */
function registrarIndicacao(escopo, codigo, novoJid) {
    const alvo = String(codigo || '').toUpperCase().trim()
    const dados = indicacoes(escopo)
    const dono = Object.values(dados).find(d => d.codigo === alvo)
    if (!dono) return { ok: false, erro: 'Código de indicação não encontrado.' }

    const numeroNovo = String(novoJid || '').split('@')[0]
    if (String(dono.jid).split('@')[0] === numeroNovo) {
        return { ok: false, erro: 'Não dá para usar o próprio código.' }
    }
    if (dono.indicados.includes(numeroNovo)) return { ok: false, erro: 'Essa pessoa já foi registrada nesse código.' }

    dono.indicados.push(numeroNovo)
    gravar(escopo, CHAVE_INDICACOES, dados)
    return { ok: true, dono, total: dono.indicados.length }
}

/** Ranking de quem mais trouxe gente. */
function rankingIndicacoes(escopo, limite = 10) {
    return Object.values(indicacoes(escopo))
        .map(d => ({ jid: d.jid, codigo: d.codigo, total: (d.indicados || []).length }))
        .filter(d => d.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, limite)
}

// ══════════════════════════════════════════════════════════════
// ANÁLISE DE PEÇA
// ══════════════════════════════════════════════════════════════

/**
 * Avalia um texto de divulgação.
 * Mede o que dá para medir — tamanho, chamada, link, exagero — e diz o que
 * corrigir. Não promete adivinhar se vai converter.
 */
function avaliarPeca(texto, formato = 'anuncio') {
    const t = String(texto || '')
    const f = FORMATOS[formato] || FORMATOS.anuncio
    const problemas = []
    const acertos = []

    if (!t.trim()) return { nota: 0, problemas: ['A peça está vazia.'], acertos: [], formato: f }

    if (t.length > f.limite) problemas.push(`Passa de ${f.limite} caracteres (tem ${t.length}). Corte.`)
    else acertos.push(`Tamanho adequado (${t.length}/${f.limite})`)

    const temLink = /https?:\/\/|wa\.me|chat\.whatsapp/i.test(t)
    if (temLink) acertos.push('Tem link')
    else problemas.push('Sem link: a pessoa lê e não sabe para onde ir.')

    const temChamada = /\b(clique|acesse|entre|participe|garanta|chame|responda|comente|marque|venha|confira)\b/i.test(t)
    if (temChamada) acertos.push('Tem chamada para ação')
    else problemas.push('Sem chamada para ação: diga o que a pessoa deve fazer.')

    const letras = (t.match(/[A-Za-zÀ-ÿ]/g) || []).length
    const maiusculas = (t.match(/[A-ZÀ-Þ]/g) || []).length
    if (letras > 20 && maiusculas / letras > 0.5) problemas.push('Maiúsculas demais: lê-se como grito.')

    const emojis = (t.match(/\p{Emoji_Presentation}/gu) || []).length
    if (emojis > 12) problemas.push(`${emojis} emojis é excesso; poluem a leitura.`)
    else if (emojis > 0) acertos.push('Uso moderado de emoji')

    if (/[!?]{3,}/.test(t)) problemas.push('Pontuação exagerada (!!! ou ???).')
    const linhas = t.split('\n').filter(l => l.trim()).length
    if (linhas === 1 && t.length > 200) problemas.push('Um bloco só: quebre em linhas para dar respiro.')
    else if (linhas > 1) acertos.push('Texto quebrado em linhas')

    const nota = Math.max(0, Math.min(100, 100 - problemas.length * 18))
    return { nota, problemas, acertos, formato: f, caracteres: t.length, emojis, linhas }
}

module.exports = {
    SITUACOES,
    FORMATOS,
    TETO_CAMPANHAS,
    campanhas,
    acharCampanha,
    criarCampanha,
    atualizarCampanha,
    removerCampanha,
    registrarEnvio,
    historico,
    alcancePotencial,
    melhoresHorarios,
    indicacoes,
    codigoDe,
    registrarIndicacao,
    rankingIndicacoes,
    avaliarPeca
}
