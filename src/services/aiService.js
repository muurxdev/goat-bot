/**
 * AI & Web Search Intelligence Service v3
 * Motor de inteligência e pesquisa em tempo real, natural e sem disclaimers
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { tempDir } = require('../config/paths')
const { getBotName } = require('../config/botConfig')
const logger = require('../core/logger')

/**
 * Pesquisa em tempo real na Web (Wikipedia API + DuckDuckGo API + HTML Lite)
 * Retorna títulos, snippets e URLs diretas
 * @param {string} query
 * @returns {Promise<Array<{url: string, title: string, snippet: string}>>}
 */
async function searchWeb(query) {
    if (!query || typeof query !== 'string') return []
    const results = []
    const cleanQuery = query.trim()

    // 1. Wikipedia API em Português (respostas factuais instantâneas)
    try {
        const wikiUrl = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=4&namespace=0&format=json`
        const res = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'GoatBot/2.0 (WhatsApp Assistant; contact@goatbot.example)' },
            signal: AbortSignal.timeout(5000)
        })

        if (res.ok) {
            const data = await res.json()
            const titles = data[1] || []
            const snippets = data[2] || []
            const urls = data[3] || []
            for (let i = 0; i < titles.length && results.length < 3; i++) {
                if (urls[i] && snippets[i]) {
                    results.push({
                        title: titles[i],
                        snippet: snippets[i],
                        url: urls[i]
                    })
                }
            }
        }
    } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:48: ${errIgnorado.message}`) }

    // 2. DuckDuckGo Instant Answer API
    if (results.length < 3) {
        try {
            const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`
            const res = await fetch(ddgApiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                signal: AbortSignal.timeout(5000)
            })
            if (res.ok) {
                const data = await res.json()
                if (data.AbstractText && data.AbstractURL) {
                    results.push({
                        title: data.Heading || cleanQuery,
                        snippet: data.AbstractText,
                        url: data.AbstractURL
                    })
                }
                if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                    for (const topic of data.RelatedTopics) {
                        if (topic.Text && topic.FirstURL && results.length < 4) {
                            results.push({
                                title: topic.Text.slice(0, 50),
                                snippet: topic.Text,
                                url: topic.FirstURL
                            })
                        }
                    }
                }
            }
        } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:79: ${errIgnorado.message}`) }
    }

    // 3. DuckDuckGo HTML Scraper com headers rotativos como fallback
    if (results.length < 3) {
        try {
            const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(cleanQuery)
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
                },
                signal: AbortSignal.timeout(6000)
            })
            if (res.ok) {
                const html = await res.text()
                const blocks = html.split(/class="result\s+/)
                for (let i = 1; i < blocks.length && results.length < 5; i++) {
                    const block = blocks[i]
                    const urlMatch = block.match(/href="([^"]+)"[^>]*class="result__url"/i) || block.match(/class="result__url"[^>]*href="([^"]+)"/i) || block.match(/href="([^"]+)"/i)
                    const titleMatch = block.match(/class="result__title"[^>]*>([\s\S]*?)<\/h2>/i) || block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/i)
                    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i) || block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/span>/i)

                    if (urlMatch && (titleMatch || snippetMatch)) {
                        let u = urlMatch[1]
                        try {
                            const parsed = new URL(u, 'https://duckduckgo.com')
                            if (parsed.searchParams.has('uddg')) u = decodeURIComponent(parsed.searchParams.get('uddg'))
                        } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:108: ${errIgnorado.message}`) }

                        const clean = (str) => (str || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim()
                        const title = clean(titleMatch ? titleMatch[1] : '')
                        const snippet = clean(snippetMatch ? snippetMatch[1] : '')

                        if (snippet && !u.includes('duckduckgo.com') && !u.includes('y.js')) {
                            results.push({ url: u, title: title || 'Fonte Web', snippet })
                        }
                    }
                }
            }
        } catch (err) {
            logger.warn(`[SEARCH WEB WARN] ${err.message}`)
        }
    }

    return results
}

/**
 * Consulta oficial de artigos na Wikipédia em português
 * @param {string} query
 * @returns {Promise<{title: string, extract: string, url: string}|null>}
 */
async function searchWiki(query) {
    if (!query || typeof query !== 'string') return null
    const clean = query.trim()

    // 1. Tenta API REST oficial de sumário da Wikipédia em português
    try {
        const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean.replace(/\s+/g, '_'))}`
        const res = await fetch(url, {
            headers: { 'User-Agent': 'GoatBot/2.0 (WhatsApp Assistant; contact@goatbot.example)' },
            signal: AbortSignal.timeout(5000)
        })
        if (res.ok) {
            const data = await res.json()
            if (data.extract && data.type !== 'disambiguation') {
                return {
                    title: data.title,
                    extract: data.extract,
                    url: data.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(data.title)}`
                }
            }
        }
    } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:154: ${errIgnorado.message}`) }

    // 2. Fallback: Opensearch para achar o título exato mais próximo
    try {
        const searchUrl = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(clean)}&limit=1&namespace=0&format=json`
        const res = await fetch(searchUrl, {
            headers: { 'User-Agent': 'GoatBot/2.0 (WhatsApp Assistant; contact@goatbot.example)' },
            signal: AbortSignal.timeout(5000)
        })
        if (res.ok) {
            const data = await res.json()
            const title = data[1]?.[0]
            const snippet = data[2]?.[0]
            const url = data[3]?.[0]
            if (title) {
                try {
                    const sumRes = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`, {
                        headers: { 'User-Agent': 'GoatBot/2.0 (WhatsApp Assistant; contact@goatbot.example)' },
                        signal: AbortSignal.timeout(4000)
                    })
                    if (sumRes.ok) {
                        const sumData = await sumRes.json()
                        if (sumData.extract) {
                            return {
                                title: sumData.title,
                                extract: sumData.extract,
                                url: sumData.content_urls?.desktop?.page || url
                            }
                        }
                    }
                } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:184: ${errIgnorado.message}`) }
                if (snippet) {
                    return { title, extract: snippet, url }
                }
            }
        }
    } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:190: ${errIgnorado.message}`) }

    return null
}

/**
 * Resposta direta de Inteligência Artificial sem fontes ou certificações expostas
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAI(prompt) {
    const cleanPrompt = String(prompt || '').trim()
    const botName = getBotName()

    if (!cleanPrompt) {
        return `Olá! Sou o *${botName}*.\n\nComo posso te ajudar hoje? Você pode me fazer perguntas sobre qualquer assunto, curiosidades, resumos, traduções ou cálculos!`
    }

    const lower = cleanPrompt.toLowerCase()

    // A. Resposta direta sobre o Bot / Sistema
    if (
        lower.includes('esse chatbot') ||
        lower.includes('este chatbot') ||
        lower.includes('este bot') ||
        lower.includes('esse bot') ||
        lower.includes('o bot funciona') ||
        lower.includes('como você funciona') ||
        lower.includes('quem te criou') ||
        lower.includes('quem é você') ||
        lower.includes('sobre o bot')
    ) {
        let card = `╔══════════════════════════════╗\n`
        card += `║    🤖 *SOBRE O ${botName}* 🤖    ║\n`
        card += `╚══════════════════════════════╝\n\n`
        card += `✨ *Olá! Sou o ${botName}*, assistente virtual inteligente e sistema modular completo para WhatsApp.\n\n`
        card += `╭━〔 ⚙️ ARQUITETURA & TECNOLOGIA 〕━⬣\n`
        card += `┃ 🧠 *Núcleo:* Node.js moderno de alta performance\n`
        card += `┃ 🗄️ *Banco de Dados:* SQLite WAL (100% Persistente e Atômico)\n`
        card += `┃ 📦 *Módulos:* Mais de 2000 comandos em 16 categorias\n`
        card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        card += `╭━〔 🌟 PRINCIPAIS FUNCIONALIDADES 〕━⬣\n`
        card += `┃ ⚔️ *RPG Saga Épica:* 500 comandos, Clãs, Mandamentos e Forja\n`
        card += `┃ 📥 *Media Hub HD:* Downloads de Spotify, TikTok, YouTube, Kwai, Insta, X\n`
        card += `┃ 🏆 *Economia & Níveis:* Sistema de XP infinito, Carteira, Cassino\n`
        card += `┃ 🛡️ *Moderação:* Anti-Link, Warnings, Banimento e Aluguel\n`
        card += `┃ 🔍 *Pesquisa & IA:* Respostas rápidas, inteligentes e naturais\n`
        card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        card += `👑 *Dono:* ${botName}\n`
        card += `💡 _Digite_ \`.menu\` _para navegar por todos os comandos!_`
        return card
    }

    try {
        const llm = require('./llmService')

        // 1. Provedores de IA em nuvem
        if (llm.hasProvider()) {
            try {
                const aiResult = await llm.ask(cleanPrompt)
                const text = typeof aiResult === 'object' ? aiResult?.text : aiResult
                if (text && text.trim()) {
                    return text.trim()
                }
            } catch (llmErr) {
                logger.warn(`[AI SERVICE] Falha primária no LLM: ${llmErr.message}`)
            }
        }

        // 2. Consulta inteligente via iaEngine (trata conversas, contas, Wikipedia e busca sem disclaimers)
        const iaEngine = require('./iaEngine')
        const r = await iaEngine.responder(cleanPrompt)
        if (r && r.texto && r.texto.trim()) {
            return r.texto.trim()
        }

        // 3. Fallback: Pesquisa Web limpa
        const webResults = await searchWeb(cleanPrompt)
        if (webResults && webResults.length > 0) {
            const primary = webResults[0]
            let sintese = null
            try {
                if (llm.hasProvider()) sintese = await llm.askComContexto(cleanPrompt, webResults)
            } catch (errIgnorado) { logger.warn(`[AISERVICE] Falha ignorada em src/services/aiService.js:273: ${errIgnorado.message}`) }

            return (sintese || primary.snippet || '').trim()
        }

        return `Não consegui encontrar detalhes sobre isso no momento. Tente reformular a pergunta de forma mais direta!`
    } catch (err) {
        logger.error('[AI SERVICE ERROR]', err)
        return `Não foi possível processar sua solicitação no momento.`
    }
}

/**
 * Síntese de voz em Português com suporte a textos longos e efeitos de áudio.
 * @param {string} text
 * @param {string} [effect] - 'grave' | 'esquilo' | 'radio' | 'eco'
 * @returns {Promise<string>} Caminho do arquivo de áudio gerado
 */
async function generateTTS(text, effect = null) {
    const cleanText = String(text).slice(0, 1200).trim()
    if (!cleanText) throw new Error('Texto inválido para síntese de voz.')

    const audioDir = path.join(tempDir, 'tts')
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true })
    }

    // 1. Divide em pedaços de até 160 caracteres respeitando pontuação
    const chunks = []
    let rest = cleanText
    while (rest.length > 160) {
        let splitIdx = rest.slice(0, 160).lastIndexOf('.')
        if (splitIdx === -1 || splitIdx < 50) splitIdx = rest.slice(0, 160).lastIndexOf(',')
        if (splitIdx === -1 || splitIdx < 50) splitIdx = rest.slice(0, 160).lastIndexOf(' ')
        if (splitIdx === -1) splitIdx = 160
        chunks.push(rest.slice(0, splitIdx + 1).trim())
        rest = rest.slice(splitIdx + 1).trim()
    }
    if (rest) chunks.push(rest)

    // 2. Baixa cada pedaço de áudio
    const fetchChunk = (chunk) => new Promise((resolve, reject) => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=${encodeURIComponent(chunk)}`
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode !== 200) return reject(new Error(`TTS HTTP ${res.statusCode}`))
            const data = []
            res.on('data', d => data.push(d))
            res.on('end', () => resolve(Buffer.concat(data)))
            res.on('error', reject)
        }).on('error', reject)
    })

    const buffers = []
    for (const ch of chunks) {
        if (!ch) continue
        const b = await fetchChunk(ch)
        buffers.push(b)
    }

    const mergedBuffer = Buffer.concat(buffers)
    const baseOut = path.join(audioDir, `tts_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`)
    fs.writeFileSync(baseOut, mergedBuffer)

    // 3. Aplica efeitos via ffmpeg se disponível
    if (effect && ['grave', 'esquilo', 'radio', 'eco', 'goat'].includes(effect)) {
        try {
            const { spawnSync } = require('child_process')
            let filter = ''
            if (effect === 'esquilo') filter = 'asetrate=44100*1.3,atempo=1.1'
            else if (effect === 'grave') filter = 'asetrate=44100*0.8,atempo=0.9'
            else if (effect === 'radio') filter = 'highpass=f=300,lowpass=f=3000'
            else if (effect === 'eco' || effect === 'goat') filter = 'aecho=0.8:0.88:60:0.4'

            if (filter) {
                const effectedOut = path.join(audioDir, `fx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`)
                const ff = spawnSync('ffmpeg', ['-y', '-i', baseOut, '-filter:a', filter, effectedOut])
                if (ff.status === 0 && fs.existsSync(effectedOut)) {
                    try { fs.unlinkSync(baseOut) } catch (err) { logger.warn('[AISERVICE] falha ignorada: ' + (err && err.message)) }
                    return effectedOut
                }
            }
        } catch (_) {
            // Se falhar ffmpeg, retorna o áudio original limpo
        }
    }

    return baseOut
}

/**
 * Analisa e inspeciona imagem com Inteligência Artificial Vision e OCR.
 * @param {Buffer} buffer
 * @param {string} [mimeType]
 * @param {string} [prompt]
 * @returns {Promise<string>}
 */
async function analyzeImage(buffer, mimeType = 'image/jpeg', prompt = '') {
    const llm = require('./llmService')
    return llm.askVision({ buffer, mimeType, prompt })
}

/**
 * Transcrição direta de áudio em memória via nuvem (Groq Whisper, Gemini) sem ffmpeg.
 * @param {Buffer} buffer
 * @param {string} [mimeType]
 * @returns {Promise<{ text: string, engine: string }|null>}
 */
async function transcribeAudioDirect(buffer, mimeType = 'audio/ogg') {
    const llm = require('./llmService')
    return llm.transcribeAudioDirect({ buffer, mimeType })
}

/**
 * Análise textual avançada (NLP, estatísticas, sentimento).
 * @param {string} texto
 */
function analisarTexto(texto) {
    const llm = require('./llmService')
    return llm.analisarTexto(texto)
}

module.exports = {
    searchWeb,
    searchWiki,
    askAI,
    analyzeImage,
    transcribeAudioDirect,
    analisarTexto,
    generateTTS
}
