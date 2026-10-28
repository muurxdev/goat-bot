/**
 * LLM Service — IA em Nuvem de Alta Velocidade para .ia / .explicar / .resumir / .traduzir.
 *
 * Provedores em nuvem (respostas instantâneas em ~1-2s):
 *   0. ANTHROPIC_API_KEY  — Claude (API paga, chave do console.anthropic.com — NÃO é o plano Claude Max/Code).
 *                           Vai primeiro quando existe; ANTHROPIC_MODEL troca o modelo e há teto diário
 *                           (ANTHROPIC_DAILY_MAX_CALLS / _TOKENS): estourou, cai nos provedores abaixo.
 *   1. GEMINI_API_KEY     — Google Gemini (plano gratuito). O modelo é descoberto na conta: o "flash" estável mais novo.
 *   2. GROQ_API_KEY       — Groq (gratuito, rápido); escolhe o melhor de GROQ_PREFERIDOS disponível.
 *   3. PERPLEXITY_API_KEY — Sonar com busca em tempo real.
 *   4. CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN — Workers AI.
 *   5. OLLAMA_URL         — Ollama local opcional.
 */

const logger = require('../core/logger')

const TIMEOUT_MS = 25000
const TIMEOUT_LOCAL_MS = 60000

// Sem GEMINI_MODEL/GROQ_MODEL no .env, o modelo é descoberto na própria conta
// (ver _modeloGemini/_modeloGroq). Estes só valem se a descoberta falhar.
const GEMINI_RESERVA = 'gemini-2.5-flash'
const GROQ_PREFERIDOS = ['openai/gpt-oss-120b', 'moonshotai/kimi-k2-instruct', 'llama-3.3-70b-versatile']

function _cfg() {
    return {
        anthropicKey: (process.env.ANTHROPIC_API_KEY || '').trim(),
        // Haiku: rápido e o mais barato da família — certo para um bot de grupo. Troque para
        // 'claude-sonnet-5-5' (ou opus) pelo .env quando a resposta precisar de mais raciocínio.
        anthropicModel: (process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5').trim(),
        geminiKey: (process.env.GEMINI_API_KEY || '').trim(),
        geminiModel: (process.env.GEMINI_MODEL || '').trim(),
        geminiSearchGrounding: String(process.env.GEMINI_SEARCH_GROUNDING || 'true').toLowerCase() !== 'false',
        groqKey: (process.env.GROQ_API_KEY || '').trim(),
        groqModel: (process.env.GROQ_MODEL || '').trim(),
        perplexityKey: (process.env.PERPLEXITY_API_KEY || '').trim(),
        perplexityModel: (process.env.PERPLEXITY_MODEL || 'sonar').trim(),
        cfAccount: (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim(),
        cfToken: (process.env.CLOUDFLARE_API_TOKEN || '').trim(),
        cfModel: (process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct').trim(),
        ollamaUrl: (process.env.OLLAMA_URL || '').trim().replace(/\/$/, ''),
        ollamaModel: (process.env.OLLAMA_MODEL || 'qwen2.5:3b').trim()
    }
}

/** @returns {boolean} há algum provedor com chave configurada */
function hasProvider() {
    const c = _cfg()
    return Boolean(c.anthropicKey || c.geminiKey || c.groqKey || c.perplexityKey || (c.cfAccount && c.cfToken) || c.ollamaUrl)
}

/** @returns {string[]} nomes dos provedores ativos (para diagnóstico). */
function providersAtivos() {
    const c = _cfg()
    const l = []
    if (c.anthropicKey) l.push(`Claude (${c.anthropicModel})`)
    if (c.geminiKey) l.push(`Google Gemini (${c.geminiModel || _descoberto.gemini?.modelo || 'automático'})`)
    if (c.groqKey) l.push(`Groq (${c.groqModel || _descoberto.groq?.modelo || 'automático'})`)
    if (c.perplexityKey) l.push(`Perplexity (${c.perplexityModel})`)
    if (c.cfAccount && c.cfToken) l.push(`Cloudflare (${c.cfModel})`)
    if (c.ollamaUrl) l.push(`Ollama local (${c.ollamaModel})`)
    if (!l.length) l.push('Free Web AI (Gratuito & Aberto)')
    return l
}

async function _fetchJson(url, options, timeoutMs = TIMEOUT_MS) {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), timeoutMs)
    try {
        const res = await fetch(url, { ...options, signal: ctl.signal })
        const texto = await res.text()
        let json = null
        try { json = JSON.parse(texto) } catch (_) { /* resposta não-JSON */ }
        if (!res.ok) {
            const detalhe = (json && (json.error?.message || json.message)) || texto.slice(0, 160)
            throw new Error(`HTTP ${res.status}: ${detalhe}`)
        }
        return json
    } finally {
        clearTimeout(t)
    }
}

// ── Descoberta do modelo ──────────────────────────────────────────
// O modelo "atual" muda a cada poucos meses e o antigo é desligado. Em vez de
// fixar um nome no código (era 'gemini-2.0-flash'), o bot pergunta à própria
// conta quais existem e escolhe o melhor. O resultado vale por 6 h.
const DESCOBERTA_TTL_MS = 6 * 60 * 60 * 1000
const _descoberto = { gemini: null, groq: null }

/**
 * Entre os modelos Gemini da conta, o "flash" estável de versão mais alta:
 * é o que o plano gratuito libera com limite folgado. Fica de fora preview,
 * experimental, lite, TTS, imagem e embedding.
 * @param {string[]} nomes  ex.: ['models/gemini-2.5-flash', ...]
 * @returns {string|null}
 */
function escolherGemini(nomes = []) {
    const candidatos = nomes
        .map(n => String(n).replace(/^models\//, ''))
        .map(n => ({ n, m: n.match(/^gemini-(\d+(?:\.\d+)?)-flash$/) }))
        .filter(x => x.m)
        .sort((a, b) => Number(b.m[1]) - Number(a.m[1]))
    return candidatos[0]?.n || null
}

async function _modeloGemini(c) {
    if (c.geminiModel) return c.geminiModel
    const cache = _descoberto.gemini
    if (cache && Date.now() - cache.em < DESCOBERTA_TTL_MS) return cache.modelo
    let modelo = GEMINI_RESERVA
    try {
        const json = await _fetchJson('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
            headers: { 'x-goog-api-key': c.geminiKey }
        })
        const nomes = (json?.models || [])
            .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
            .map(m => m.name)
        modelo = escolherGemini(nomes) || GEMINI_RESERVA
        logger.info(`[LLM] Gemini: usando ${modelo} (escolhido entre ${nomes.length} modelos da conta)`)
    } catch (err) {
        logger.warn(`[LLM] Não consegui listar os modelos do Gemini (${err.message}); usando ${GEMINI_RESERVA}.`)
    }
    _descoberto.gemini = { modelo, em: Date.now() }
    return modelo
}

async function _modeloGroq(c) {
    if (c.groqModel) return c.groqModel
    const cache = _descoberto.groq
    if (cache && Date.now() - cache.em < DESCOBERTA_TTL_MS) return cache.modelo
    let modelo = GROQ_PREFERIDOS[GROQ_PREFERIDOS.length - 1]
    try {
        const json = await _fetchJson('https://api.groq.com/openai/v1/models', {
            headers: { Authorization: `Bearer ${c.groqKey}` }
        })
        const ids = new Set((json?.data || []).map(m => m.id))
        modelo = GROQ_PREFERIDOS.find(id => ids.has(id)) || modelo
        logger.info(`[LLM] Groq: usando ${modelo}`)
    } catch (err) {
        logger.warn(`[LLM] Não consegui listar os modelos do Groq (${err.message}); usando ${modelo}.`)
    }
    _descoberto.groq = { modelo, em: Date.now() }
    return modelo
}

// Limites de saída folgados: nos modelos que "pensam" antes de responder, o
// raciocínio gasta do mesmo limite. Com 1.200 a resposta chegava cortada ou vazia.
const MAX_SAIDA = 8192

// ── Claude (Anthropic) ────────────────────────────────────────────
// A chave é paga por uso: o bot é aberto a grupos, então há teto diário, em memória (zera na
// virada do dia e no restart). Além dele, o limite que vale de verdade é o de gasto mensal do
// console.anthropic.com — configure lá também.
const _usoClaude = { dia: '', chamadas: 0, tokens: 0 }

function _usoDoDia() {
    const hoje = new Date().toISOString().slice(0, 10)
    if (_usoClaude.dia !== hoje) { _usoClaude.dia = hoje; _usoClaude.chamadas = 0; _usoClaude.tokens = 0 }
    return _usoClaude
}

/** O Claude é o motor configurado? (com ele, os caminhos locais de busca/resumo não são usados) */
function claudeAtivo() {
    return Boolean(_cfg().anthropicKey)
}

/** Uso de hoje e os tetos (para diagnóstico e testes). */
function usoClaude() {
    const u = _usoDoDia()
    return {
        dia: u.dia,
        chamadas: u.chamadas,
        tokens: u.tokens,
        maxChamadas: Number(process.env.ANTHROPIC_DAILY_MAX_CALLS) || 300,
        maxTokens: Number(process.env.ANTHROPIC_DAILY_MAX_TOKENS) || 500000
    }
}

async function _claude(prompt, system, c) {
    const uso = usoClaude()
    if (uso.chamadas >= uso.maxChamadas || uso.tokens >= uso.maxTokens) {
        throw new Error(`teto diário do Claude atingido (${uso.chamadas} chamadas, ${uso.tokens} tokens)`)
    }
    const json = await _fetchJson('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': c.anthropicKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: c.anthropicModel,
            max_tokens: MAX_SAIDA,
            system,
            messages: [{ role: 'user', content: prompt }]
        })
    })
    const u = _usoDoDia()
    u.chamadas += 1
    u.tokens += (Number(json?.usage?.input_tokens) || 0) + (Number(json?.usage?.output_tokens) || 0)
    const texto = (json?.content || []).filter(b => b && b.type === 'text').map(b => b.text).join('\n').trim()
    return texto || null
}

/**
 * Pesquisa de verdade: o Claude busca na web (ferramenta do servidor da Anthropic) e responde com
 * o que achou. Substitui o caminho local (raspar DuckDuckGo + juntar trechos + pontuar), que era
 * frágil — qualquer mudança de HTML do site quebrava a busca em silêncio.
 * @param {string} pergunta
 * @param {{system?: string}} [opts]
 * @returns {Promise<{text: string, sources: Array<{title:string, url:string}>}|null>}
 */
async function pesquisar(pergunta, opts = {}) {
    const texto = String(pergunta || '').trim()
    const c = _cfg()
    if (!texto || !c.anthropicKey) return null

    const uso = usoClaude()
    if (uso.chamadas >= uso.maxChamadas || uso.tokens >= uso.maxTokens) {
        logger.warn(`[LLM] Pesquisa não feita: teto diário do Claude atingido (${uso.chamadas} chamadas, ${uso.tokens} tokens)`)
        return null
    }

    const system = opts.system || [
        SYSTEM_PADRAO,
        '',
        'Para esta pergunta use a busca na web quando a resposta depender de fato recente, de dado que muda ou de algo que você não tem certeza.',
        'Cite o essencial em linguagem natural; não cole endereços no meio do texto — as fontes vão separadas.'
    ].join('\n')

    const mensagens = [{ role: 'user', content: texto }]
    const ferramenta = {
        type: process.env.ANTHROPIC_WEB_SEARCH_TOOL || 'web_search_20250305',
        name: 'web_search',
        max_uses: Number(process.env.ANTHROPIC_WEB_SEARCH_MAX_USES) || 3,
        user_location: { type: 'approximate', country: 'BR', timezone: 'America/Sao_Paulo' }
    }

    let blocos = []
    // A busca pode pausar o turno (pause_turn): devolve-se o que veio e a conversa continua.
    for (let volta = 0; volta < 3; volta++) {
        const json = await _fetchJson('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-api-key': c.anthropicKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: c.anthropicModel, max_tokens: MAX_SAIDA, system, messages: mensagens, tools: [ferramenta] })
        }, 60000)
        const u = _usoDoDia()
        u.chamadas += 1
        u.tokens += (Number(json?.usage?.input_tokens) || 0) + (Number(json?.usage?.output_tokens) || 0)
        blocos = blocos.concat(json?.content || [])
        if (json?.stop_reason !== 'pause_turn') break
        mensagens.push({ role: 'assistant', content: json.content })
    }

    const resposta = blocos.filter(b => b && b.type === 'text').map(b => b.text).join('').trim()
    if (!resposta) return null

    const vistos = new Set()
    const sources = []
    const adicionar = (url, titulo) => {
        const u = String(url || '').trim()
        if (!/^https?:\/\//i.test(u) || vistos.has(u)) return
        vistos.add(u)
        sources.push({ title: String(titulo || u).trim().slice(0, 120), url: u })
    }
    for (const b of blocos) {
        if (b?.type === 'text') for (const ct of (b.citations || [])) adicionar(ct.url, ct.title)
        if (b?.type === 'web_search_tool_result' && Array.isArray(b.content)) for (const r of b.content) adicionar(r.url, r.title)
    }
    return { text: paraWhatsApp(resposta), sources: sources.slice(0, 5) }
}

async function _groq(prompt, system, c) {
    const json = await _fetchJson('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.groqKey}` },
        body: JSON.stringify({
            model: await _modeloGroq(c),
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: MAX_SAIDA
        })
    })
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _gemini(prompt, system, c, returnSources = false) {
    const modelo = await _modeloGemini(c)
    // Chave no cabeçalho, não na URL: URL costuma aparecer em log de erro.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`
    const payload = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: MAX_SAIDA }
    }
    if (c.geminiSearchGrounding) {
        payload.tools = [{ googleSearch: {} }]
    }

    let json
    try {
        json = await _fetchJson(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': c.geminiKey },
            body: JSON.stringify(payload)
        })
    } catch (err) {
        // Se a API rejeitar o grounding de busca, refaz sem a ferramenta
        if (payload.tools) {
            delete payload.tools
            json = await _fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': c.geminiKey },
                body: JSON.stringify(payload)
            })
        } else {
            throw err
        }
    }

    const candidate = json?.candidates?.[0]
    const partes = candidate?.content?.parts
    const text = Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() || null : null

    const sources = []
    const chunks = candidate?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
        if (chunk.web?.uri) {
            sources.push({
                title: chunk.web.title || 'Web Search',
                url: chunk.web.uri,
                snippet: ''
            })
        }
    }

    if (returnSources) {
        return { text, sources }
    }
    return text
}

async function _perplexity(prompt, system, c) {
    const json = await _fetchJson('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.perplexityKey}` },
        body: JSON.stringify({
            model: c.perplexityModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1200
        })
    })
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _cloudflare(prompt, system, c) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${c.cfAccount}/ai/run/${c.cfModel}`
    const json = await _fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.cfToken}` },
        body: JSON.stringify({
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            max_tokens: 1000
        })
    })
    return (json?.result?.response || '').trim() || null
}

async function _ollama(prompt, system, c) {
    const json = await _fetchJson(`${c.ollamaUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: c.ollamaModel,
            messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 500
        })
    }, TIMEOUT_LOCAL_MS)
    return json?.choices?.[0]?.message?.content?.trim() || null
}

async function _freeWebAI(prompt, system) {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 5000)
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: prompt }
                ],
                model: 'openai-fast'
            }),
            signal: ctl.signal
        })
        const text = await res.text()
        return (text && text.trim()) ? text.trim() : null
    } catch (e) {
        logger.warn(`[FREE WEB AI] Falha na IA aberta: ${e.message}`)
        return null
    } finally {
        clearTimeout(t)
    }
}

const SYSTEM_PADRAO = [
    'Você é o GOATBOT, assistente inteligente do time de WhatsApp brasileiro: ágil, focado, prestativo e com a visão de jogo de craque.',
    'Responda sempre em português do Brasil, com linguagem natural e simples, como um bom professor conversando.',
    '',
    'Como responder:',
    '- Primeiro entenda o que a pessoa quer de verdade, inclusive quando a pergunta vier com erro de digitação, gíria ou pela metade.',
    '- Comece pela resposta direta, em uma ou duas frases. Depois explique o porquê e dê um exemplo do dia a dia quando ajudar.',
    '- Pergunta simples pede resposta curta. Conceito, passo a passo ou comparação pede explicação organizada, sem enrolação.',
    '- Se não souber ou não tiver certeza, diga isso claramente em vez de inventar.',
    '- Conversa casual (oi, tudo bem, piada) pede resposta curta e simpática.',
    '',
    'Formatação do WhatsApp (obrigatória):',
    '- Negrito é *um asterisco de cada lado*; itálico é _sublinhado_. Nunca use ** nem # nem tabelas.',
    '- Listas com "• " no começo da linha; passos numerados com "1. ".',
    '- Parágrafos curtos, separados por linha em branco. Poucos emojis.',
    '- Não mencione fontes, links, buscas nem que a resposta foi gerada por IA.'
].join('\n')

/**
 * Converte o Markdown que os modelos insistem em escrever para a formatação do
 * WhatsApp: o WhatsApp mostra "**texto**" e "## Título" crus, com os símbolos.
 * Blocos de código (```) passam intactos.
 * @param {string} texto
 * @returns {string}
 */
function paraWhatsApp(texto) {
    if (typeof texto !== 'string' || !texto) return texto
    return texto.split(/(```[\s\S]*?```)/).map(pedaco => {
        if (pedaco.startsWith('```')) return pedaco
        return pedaco
            .replace(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/gm, '*$1*')        // ## Título → *Título*
            .replace(/\*\*\*(.+?)\*\*\*/g, '*_$1_*')                       // ***x*** → *_x_*
            .replace(/\*\*(.+?)\*\*/g, '*$1*')                             // **x** → *x*
            .replace(/__(.+?)__/g, '_$1_')                                 // __x__ → _x_
            .replace(/~~(.+?)~~/g, '~$1~')                                 // ~~x~~ → ~x~
            .replace(/^(\s*)[-*+]\s+/gm, '$1• ')                           // - item → • item
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)')   // [txt](url) → txt (url)
            .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, '')               // --- separador
            .replace(/^\|.*\|\s*$/gm, l => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim()).filter(Boolean).join(' · '))
            .replace(/^\s*·?\s*:?-{2,}:?(\s*·\s*:?-{2,}:?)*\s*$/gm, '')      // linha |---|---| da tabela
    }).join('').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Pergunta ao primeiro provedor disponível, com fallback em cadeia.
 * @param {string} prompt
 * @param {{system?: string, returnSources?: boolean}} [opts]
 * @returns {Promise<string|{text: string, sources: Array}|null>}
 */
async function ask(prompt, opts = {}) {
    const texto = String(prompt || '').trim()
    if (!texto) return null
    const c = _cfg()
    const system = opts.system || SYSTEM_PADRAO
    const returnSources = Boolean(opts.returnSources)

    const nuvem = []
    // Claude primeiro: é a chave que o dono paga para ser o motor; os gratuitos ficam de reserva.
    if (c.anthropicKey) nuvem.push(['Claude', async () => {
        const text = await _claude(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])
    if (c.geminiKey) nuvem.push(['Google Gemini', () => _gemini(texto, system, c, returnSources)])
    if (c.groqKey) nuvem.push(['Groq', async () => {
        const text = await _groq(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])
    if (c.perplexityKey) nuvem.push(['Perplexity', async () => {
        const text = await _perplexity(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])
    if (c.cfAccount && c.cfToken) nuvem.push(['Cloudflare', async () => {
        const text = await _cloudflare(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])

    const local = []
    if (c.ollamaUrl) local.push(['Ollama local', async () => {
        const text = await _ollama(texto, system, c)
        return returnSources ? { text, sources: [] } : text
    }])

    const preferirNuvem = String(process.env.LLM_PREFER_CLOUD || 'true').toLowerCase() !== 'false'
    // Com a chave do Claude o motor é UM: ele. Os gratuitos só entram quando não há chave — antes,
    // um Gemini/Groq esquecido no .env respondia no lugar do Claude sem ninguém perceber.
    const cadeia = c.anthropicKey ? nuvem.slice(0, 1) : (preferirNuvem ? [...nuvem, ...local] : [...local, ...nuvem])
    cadeia.push(['Free Web AI', async () => {
        const text = await _freeWebAI(texto, system)
        return returnSources ? { text, sources: [] } : text
    }])

    for (const [nome, fn] of cadeia) {
        try {
            const r = await fn()
            const hasText = returnSources ? (r && r.text) : Boolean(r)
            if (hasText) return returnSources ? { ...r, text: paraWhatsApp(r.text) } : paraWhatsApp(r)
            logger.warn(`[LLM] ${nome} respondeu vazio; tentando o próximo provedor.`)
        } catch (e) {
            logger.warn(`[LLM] ${nome} falhou: ${e.message}`)
        }
    }
    return null
}

/**
 * Responde uma pergunta APOIADA em informações de apoio, de forma natural.
 * @param {string} pergunta
 * @param {Array<{title?:string, snippet?:string, url?:string}>} resultados
 */
async function askComContexto(pergunta, resultados = []) {
    if (!resultados.length) return ask(pergunta)
    const contexto = resultados.slice(0, 5)
        .map((r, i) => `${r.title ? r.title + ':\n' : ''}${r.snippet || ''}`)
        .join('\n\n')
    const prompt =
        `Pergunta do usuário: ${pergunta}\n\n` +
        `Informações de apoio:\n${contexto}\n\n` +
        `Com base nas informações acima, responda à pergunta do usuário de forma natural, fluida e amigável em português do Brasil. Não mencione fontes, links ou trechos: apenas responda o assunto diretamente.`
    return ask(prompt)
}

/** Tradução via LLM (preserva tom e gírias). */
async function traduzir(texto, idiomaDestino = 'português do Brasil') {
    return ask(`Traduza para ${idiomaDestino}. Devolva APENAS a tradução, sem comentários:\n\n${texto}`, {
        system: 'Você é um tradutor profissional. Devolva somente a tradução direta, preservando o tom do original.'
    })
}

/** Resumo via LLM. */
async function resumir(texto) {
    return ask(`Resuma o texto abaixo de forma clara e coesa em português do Brasil:\n\n${texto}`, {
        system: 'Você é um especialista em síntese de textos. Crie um resumo fiel, fluido e agradável de ler.'
    })
}

/**
 * Análise visual de imagens usando provedores multimodais (Gemini, Claude, Groq)
 * com fallback para extração detalhada de metadados via Sharp.
 * @param {{ buffer: Buffer, mimeType?: string, prompt?: string }} params
 * @returns {Promise<string>}
 */
async function askVision({ buffer, mimeType = 'image/jpeg', prompt = '' }) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('Buffer de imagem inválido para análise visual.')
    }
    const c = _cfg()
    const instrucao = String(prompt || '').trim() || 'Analise e descreva detalhadamente o que você vê nesta imagem. Se houver texto, transcreva-o. Se houver alguma questão ou cálculo, resolva-o com explicação clara em português.'

    // 1. Google Gemini Multimodal Vision (Alta velocidade, excelente OCR e resolução de problemas)
    if (c.geminiKey) {
        try {
            const modelo = c.geminiModel || 'gemini-2.0-flash'
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`
            const base64Data = buffer.toString('base64')
            const payload = {
                systemInstruction: { parts: [{ text: SYSTEM_PADRAO }] },
                contents: [{
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64Data } },
                        { text: instrucao }
                    ]
                }],
                generationConfig: { temperature: 0.4, maxOutputTokens: MAX_SAIDA }
            }
            const json = await _fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': c.geminiKey },
                body: JSON.stringify(payload)
            }, 15000)

            const partes = json?.candidates?.[0]?.content?.parts
            const resp = Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() : null
            if (resp) return paraWhatsApp(resp)
        } catch (err) {
            logger.warn(`[VISION] Gemini Vision falhou: ${err.message}`)
        }
    }

    // 2. Claude Vision (Anthropic)
    if (c.anthropicKey) {
        try {
            const json = await _fetchJson('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': c.anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: c.anthropicModel || 'claude-haiku-5-5',
                    max_tokens: MAX_SAIDA,
                    system: SYSTEM_PADRAO,
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mimeType || 'image/jpeg',
                                    data: buffer.toString('base64')
                                }
                            },
                            { type: 'text', text: instrucao }
                        ]
                    }]
                })
            }, 15000)
            const resp = (json?.content || []).filter(b => b && b.type === 'text').map(b => b.text).join('\n').trim()
            if (resp) return paraWhatsApp(resp)
        } catch (err) {
            logger.warn(`[VISION] Claude Vision falhou: ${err.message}`)
        }
    }

    // 3. Groq Vision (llama-3.2-11b-vision-preview / llama-3.2-90b-vision-preview)
    if (c.groqKey) {
        try {
            const base64Data = buffer.toString('base64')
            const json = await _fetchJson('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.groqKey}` },
                body: JSON.stringify({
                    model: 'llama-3.2-11b-vision-preview',
                    messages: [
                        { role: 'system', content: SYSTEM_PADRAO },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: instrucao },
                                { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${base64Data}` } }
                            ]
                        }
                    ],
                    max_tokens: MAX_SAIDA
                })
            }, 15000)
            const resp = json?.choices?.[0]?.message?.content?.trim()
            if (resp) return paraWhatsApp(resp)
        } catch (err) {
            logger.warn(`[VISION] Groq Vision falhou: ${err.message}`)
        }
    }

    // 4. Fallback Local com Sharp (Extração de dados reais da imagem)
    try {
        const sharp = require('sharp')
        const meta = await sharp(buffer).metadata()
        const kb = Math.round(buffer.length / 1024)
        const mp = meta.width && meta.height ? ((meta.width * meta.height) / 1000000).toFixed(2) : '0.0'
        const proporcao = meta.width && meta.height ? (meta.width / meta.height).toFixed(2) : '1.0'

        let formatoLegivel = (meta.format || 'imagem').toUpperCase()
        let orientacao = meta.width > meta.height ? 'Paisagem (Horizontal)' : (meta.width < meta.height ? 'Retrato (Vertical)' : 'Quadrada (1:1)')

        let analise = `🔍 *Inspeção Técnica de Imagem:*\n`
        analise += `• *Formato:* ${formatoLegivel} (${kb} KB)\n`
        analise += `• *Resolução:* ${meta.width || '?'}x${meta.height || '?'} px (~${mp} MP)\n`
        analise += `• *Orientação:* ${orientacao} (Proporção: ${proporcao})\n`
        analise += `• *Canais de Cor:* ${meta.channels || 3} (${meta.space || 'sRGB'})\n`
        if (meta.hasAlpha) analise += `• *Transparência (Alpha):* Sim (fundo transparente detectado)\n`
        analise += `\n💡 *Instrução solicitada:* _"${instrucao}"_\n\n`
        analise += `_Nota: Para análise visual profunda de conteúdo com IA generativa e OCR automático, configure a chave gratuita \`GEMINI_API_KEY\` no .env._`

        return analise
    } catch (sharpErr) {
        return `📦 Imagem recebida (${Math.round(buffer.length / 1024)} KB). Não foi possível realizar a inspeção detalhada no momento.`
    }
}

/**
 * Transcreve áudio diretamente usando nuvem (Groq Whisper, Gemini) sem exigir ffmpeg ou ffprobe locais.
 * @param {{ buffer: Buffer, mimeType?: string }} params
 * @returns {Promise<{ text: string, engine: string }|null>}
 */
async function transcribeAudioDirect({ buffer, mimeType = 'audio/ogg' }) {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) return null
    const c = _cfg()

    // 1. Groq Whisper (O mais rápido do mercado, gratuito, suporta arquivos de áudio nativos até 25MB)
    if (c.groqKey) {
        try {
            const form = new FormData()
            const ext = mimeType.includes('mp3') ? 'mp3' : (mimeType.includes('wav') ? 'wav' : 'ogg')
            form.append('file', new Blob([buffer], { type: mimeType }), `audio.${ext}`)
            form.append('model', 'whisper-large-v3-turbo')
            form.append('response_format', 'json')
            form.append('language', 'pt')

            const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${c.groqKey}` },
                body: form,
                signal: AbortSignal.timeout(20000)
            })

            if (res.ok) {
                const data = await res.json()
                const text = String(data?.text || '').trim()
                if (text) return { text, engine: 'Groq Whisper Large V3 Turbo' }
            }
        } catch (e) {
            logger.warn(`[STT DIRECT] Groq Whisper falhou: ${e.message}`)
        }
    }

    // 2. Google Gemini Audio (Multimodal Audio nativo)
    if (c.geminiKey) {
        try {
            const modelo = c.geminiModel || 'gemini-2.0-flash'
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`
            const base64Audio = buffer.toString('base64')
            const payload = {
                contents: [{
                    parts: [
                        { inlineData: { mimeType: mimeType || 'audio/ogg', data: base64Audio } },
                        { text: 'Transcreva exatamente o que é falado neste áudio em português do Brasil. Retorne APENAS o texto falado, sem introduções ou observações.' }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
            }
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': c.geminiKey },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(25000)
            })

            if (res.ok) {
                const data = await res.json()
                const partes = data?.candidates?.[0]?.content?.parts
                const text = Array.isArray(partes) ? partes.map(p => p.text || '').join('').trim() : null
                if (text) return { text, engine: 'Google Gemini 2.0 Flash Audio' }
            }
        } catch (e) {
            logger.warn(`[STT DIRECT] Gemini Audio falhou: ${e.message}`)
        }
    }

    // 3. Local Whisper API (se configurado)
    if (process.env.WHISPER_API_URL) {
        try {
            const form = new FormData()
            form.append('file', new Blob([buffer], { type: mimeType }), 'audio.wav')
            form.append('model', process.env.WHISPER_API_MODEL || 'Systran/faster-whisper-base')
            form.append('response_format', 'json')
            const res = await fetch(process.env.WHISPER_API_URL, {
                method: 'POST',
                body: form,
                signal: AbortSignal.timeout(20000)
            })
            if (res.ok) {
                const data = await res.json()
                const text = String(data?.text || '').trim()
                if (text) return { text, engine: 'Local Faster-Whisper' }
            }
        } catch (e) {
            logger.warn(`[STT DIRECT] Local Whisper falhou: ${e.message}`)
        }
    }

    return null
}

/**
 * Análise textual avançada (estatísticas, sentimento, resumo, tópicos).
 */
function analisarTexto(texto) {
    const limpo = String(texto || '').trim()
    if (!limpo) return null

    const palavras = (limpo.match(/\S+/g) || [])
    const totalChars = limpo.length
    const charsSemEspaco = limpo.replace(/\s/g, '').length
    const frases = (limpo.match(/[.!?]+/g) || []).length || 1
    const linhas = limpo.split(/\r?\n/).length
    const mediaLetras = palavras.length ? (palavras.reduce((a, w) => a + w.length, 0) / palavras.length).toFixed(1) : 0
    const tempoLeituraMin = Math.max(1, Math.round(palavras.length / 180))

    // Frequência de palavras
    const freq = {}
    for (const w of palavras) {
        const k = w.toLowerCase().replace(/[^a-zà-ú0-9]/gi, '')
        if (k.length >= 4 && !['para', 'com', 'que', 'uma', 'como', 'mais', 'pelo', 'pela', 'este', 'esta', 'isso'].includes(k)) {
            freq[k] = (freq[k] || 0) + 1
        }
    }
    const topPalavras = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w, c]) => `\`${w}\` (${c}x)`)

    // Análise de sentimento simples
    const termosPositivos = ['bom', 'boa', 'excelente', 'otimo', 'ótimo', 'maravilha', 'perfeito', 'top', 'mestre', 'parabens', 'parabéns', 'feliz', 'obrigado', 'sucesso', 'genial']
    const termosNegativos = ['ruim', 'pessimo', 'péssimo', 'horrivel', 'horrível', 'lixo', 'droga', 'merda', 'bosta', 'odeio', 'triste', 'falha', 'erro', 'fracasso']
    let score = 0
    const palavrasLower = palavras.map(p => p.toLowerCase())
    for (const p of palavrasLower) {
        if (termosPositivos.some(t => p.includes(t))) score++
        if (termosNegativos.some(t => p.includes(t))) score--
    }

    let sentimento = 'Neutro 😐'
    if (score > 0) sentimento = `Positivo / Entusiasmado ✨ (+${score})`
    else if (score < 0) sentimento = `Negativo / Crítico ⚠️ (${score})`

    return {
        palavras: palavras.length,
        totalChars,
        charsSemEspaco,
        frases,
        linhas,
        mediaLetras,
        tempoLeituraMin,
        topPalavras,
        sentimento
    }
}

module.exports = {
    hasProvider,
    providersAtivos,
    ask,
    pesquisar,
    askComContexto,
    traduzir,
    resumir,
    askVision,
    transcribeAudioDirect,
    analisarTexto,
    paraWhatsApp,
    escolherGemini,
    usoClaude,
    claudeAtivo
}
