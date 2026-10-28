/**
 * Lote 1 — Módulo IA & Pesquisa (keyless: Google Translate, DuckDuckGo, aiService).
 * Gera com: node scripts/gen-commands.js scripts/batch-ia.js
 * IMPORTANTE: cada `execute` é serializada (toString) — sem closures; require inline.
 * Todos nascem OFF; libere com `.modulo on ia`.
 */
const CAT = 'general'
const SUB = 'IA & Pesquisa'

module.exports = [
    {
        name: 'traduzir', aliases: ['translate', 'traduz'], category: CAT, subcategory: SUB, cooldownMs: 3000,
        description: 'Traduz um texto (auto → PT, ou informe o idioma: en, es, fr...)',
        execute: async ({ text, reply }) => {
            const raw = String(text || '').trim()
            if (!raw) return reply('🌐 *Traduzir*\n\nUso: `.traduzir <idioma> <texto>`\nEx.: `.traduzir en Olá mundo`\nOu `.traduzir Bom dia` (detecta e traduz p/ PT).')
            let tl = 'pt', q = raw
            const m = raw.match(/^([a-z]{2})\s+([\s\S]+)/i)
            if (m && ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'pt', 'ar', 'hi', 'nl', 'tr'].includes(m[1].toLowerCase())) { tl = m[1].toLowerCase(); q = m[2] }
            try {
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(q)}`
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json()
                const out = (j[0] || []).map(x => x[0]).filter(Boolean).join(''); const src = j[2] || 'auto'
                if (!out) return reply('❌ Não consegui traduzir esse texto.')
                return reply(`🌐 *Tradução* (${src} → ${tl})\n\n${out}`)
            } catch (e) { return reply('❌ Serviço de tradução indisponível agora. Tente novamente.') }
        }
    },
    {
        name: 'detectaridioma', aliases: ['detectidioma', 'qualidioma'], category: CAT, subcategory: SUB, cooldownMs: 3000,
        description: 'Detecta em qual idioma um texto está escrito',
        execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('🔎 *Detectar idioma*\n\nUso: `.detectaridioma <texto>`')
            try {
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(q)}`
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json()
                const nomes = { pt: 'Português', en: 'Inglês', es: 'Espanhol', fr: 'Francês', de: 'Alemão', it: 'Italiano', ja: 'Japonês', ko: 'Coreano', zh: 'Chinês', ru: 'Russo', ar: 'Árabe', hi: 'Hindi', nl: 'Holandês', tr: 'Turco' }
                const src = j[2] || '?'
                return reply(`🔎 *Idioma detectado:* ${nomes[src] || src} (\`${src}\`)`)
            } catch (e) { return reply('❌ Não consegui detectar o idioma agora.') }
        }
    },
    {
        name: 'definir', aliases: ['definicao', 'significado'], category: CAT, subcategory: SUB, cooldownMs: 3000,
        description: 'Mostra a definição/significado de uma palavra ou termo',
        execute: async ({ text, reply }) => {
            const term = String(text || '').trim()
            if (!term) return reply('📖 *Definir*\n\nUso: `.definir <palavra ou termo>`')
            try {
                const url = `https://api.duckduckgo.com/?q=${encodeURIComponent('define ' + term)}&format=json&no_html=1&skip_disambig=1`
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to)
                const j = await r.json()
                let def = j.AbstractText || j.Definition
                if (!def && Array.isArray(j.RelatedTopics)) { const t0 = j.RelatedTopics.find(x => x && x.Text); if (t0) def = t0.Text }
                if (def) return reply(`📖 *${term}*\n\n${def}${j.AbstractURL ? '\n\n🔗 ' + j.AbstractURL : ''}`)
            } catch (e) { /* cai no fallback */ }
            try { const { askAI } = require('../../services/aiService'); return reply(await askAI('o que significa ' + term)) }
            catch (e) { return reply('❌ Não encontrei uma definição agora.') }
        }
    },
    {
        name: 'resumir', aliases: ['tldr'], category: CAT, subcategory: SUB, cooldownMs: 3000,
        description: 'Resume um texto longo destacando as frases principais',
        execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (t.length < 80) return reply('📝 *Resumir*\n\nUso: `.resumir <texto longo>` (mín. ~80 caracteres).')
            const sentences = t.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) || [t]
            if (sentences.length <= 3) return reply('📝 *Resumo:*\n\n' + t.trim())
            const stop = new Set('a o e de da do que em um uma os as para com por no na se ao dos das é foi são como mais mas ou já não sua seu ele ela isso este esta'.split(' '))
            const freq = {}; (t.toLowerCase().match(/[a-zà-ú]+/gi) || []).forEach(w => { if (w.length > 3 && !stop.has(w)) freq[w] = (freq[w] || 0) + 1 })
            const score = s => { let sc = 0; (s.toLowerCase().match(/[a-zà-ú]+/gi) || []).forEach(w => sc += freq[w] || 0); return sc / Math.max(1, s.split(' ').length) }
            const ranked = sentences.map((s, i) => ({ s, i, sc: score(s) })).sort((a, b) => b.sc - a.sc).slice(0, 3).sort((a, b) => a.i - b.i)
            return reply('📝 *Resumo:*\n\n' + ranked.map(x => '• ' + x.s.trim()).join('\n'))
        }
    },
    {
        name: 'analisartexto', aliases: ['analisetexto', 'textinfo'], category: CAT, subcategory: SUB, cooldownMs: 2500,
        description: 'Estatísticas de um texto (palavras, frases, tempo de leitura, termos frequentes)',
        execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('📊 *Analisar texto*\n\nUso: `.analisartexto <texto>`')
            const words = (t.match(/\S+/g) || []); const chars = t.length
            const noSpace = t.replace(/\s/g, '').length
            const sentences = (t.match(/[.!?]+/g) || []).length || 1; const lines = t.split(/\n/).length
            const avg = (words.reduce((a, w) => a + w.length, 0) / Math.max(1, words.length)).toFixed(1)
            const readMin = Math.max(1, Math.round(words.length / 200))
            const freq = {}; words.forEach(w => { const k = w.toLowerCase().replace(/[^a-zà-ú]/gi, ''); if (k.length > 3) freq[k] = (freq[k] || 0) + 1 })
            const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w, c]) => `${w}(${c})`).join(', ')
            return reply(`📊 *Análise do Texto*\n\n📝 Palavras: *${words.length}*\n🔤 Caracteres: *${chars}* (${noSpace} sem espaços)\n📃 Frases: *${sentences}* | Linhas: *${lines}*\n📏 Média por palavra: *${avg}* letras\n⏱️ Leitura: *~${readMin} min*\n🔝 Mais usadas: ${top || '—'}`)
        }
    },
    {
        name: 'corrigir', aliases: ['revisar', 'corrigirtexto'], category: CAT, subcategory: SUB, cooldownMs: 2500,
        description: 'Ajusta espaçamento e capitalização de um texto',
        execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('✍️ *Corrigir*\n\nUso: `.corrigir <texto>` — ajusta espaços e maiúsculas de início de frase.')
            let out = t.replace(/[ \t]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').replace(/([,.!?;:])(?=[^\s])/g, '$1 ').replace(/[ \t]+\n/g, '\n').trim()
            out = out.replace(/(^|[.!?]\s+)([a-zà-ú])/g, (mm, p, c) => p + c.toUpperCase())
            return reply('✍️ *Texto corrigido:*\n\n' + out)
        }
    },
    {
        name: 'explicar', aliases: ['explique', 'eli5'], category: CAT, subcategory: SUB, cooldownMs: 4000,
        description: 'Explica um assunto de forma simples (pesquisa em tempo real)',
        execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('🧠 *Explicar*\n\nUso: `.explicar <assunto>`')
            try { const { askAI } = require('../../services/aiService'); return reply(await askAI('explique de forma simples e resumida: ' + q)) }
            catch (e) { return reply('❌ Não consegui explicar agora.') }
        }
    },
    {
        name: 'pesquisar', aliases: ['buscar'], category: CAT, subcategory: SUB, cooldownMs: 4000,
        description: 'Busca na web e lista os principais resultados',
        execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('🔎 *Pesquisar*\n\nUso: `.pesquisar <termo>`')
            try {
                const { searchWeb } = require('../../services/aiService')
                const res = await searchWeb(q)
                if (!res || !res.length) return reply('🔎 Nada encontrado para: *' + q + '*')
                let doc = `🔎 *Resultados para:* ${q}\n\n`
                res.slice(0, 5).forEach((r, i) => { doc += `*${i + 1}.* ${r.title || 'Fonte'}\n${r.snippet ? r.snippet + '\n' : ''}🔗 ${r.url}\n\n` })
                return reply(doc.trim())
            } catch (e) { return reply('❌ Busca indisponível agora.') }
        }
    },
    {
        name: 'contar', aliases: ['contarpalavras', 'wordcount'], category: CAT, subcategory: SUB, cooldownMs: 2000,
        description: 'Conta palavras e caracteres de um texto',
        execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('🔢 *Contar*\n\nUso: `.contar <texto>`')
            const w = (t.match(/\S+/g) || []).length
            return reply(`🔢 *Contagem*\n\n📝 Palavras: *${w}*\n🔤 Caracteres: *${t.length}* (${t.replace(/\s/g, '').length} sem espaços)`)
        }
    },
    {
        name: 'inverter', aliases: ['inverte', 'reverso'], category: CAT, subcategory: SUB, cooldownMs: 2000,
        description: 'Inverte a ordem dos caracteres de um texto',
        execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('🔄 *Inverter*\n\nUso: `.inverter <texto>`')
            return reply('🔄 ' + [...t].reverse().join(''))
        }
    },
    {
        name: 'vaporwave', aliases: ['aesthetic', 'fullwidth'], category: CAT, subcategory: SUB, cooldownMs: 2000,
        description: 'Converte o texto no estilo ａｅｓｔｈｅｔｉｃ (full-width)',
        execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('🌸 *Vaporwave*\n\nUso: `.vaporwave <texto>`')
            const out = [...t].map(ch => { const c = ch.charCodeAt(0); if (c === 32) return '　'; if (c >= 33 && c <= 126) return String.fromCharCode(c + 65248); return ch }).join('')
            return reply(out)
        }
    }
]
