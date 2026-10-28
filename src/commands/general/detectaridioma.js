/**
 * Comando .detectaridioma — Detecta em qual idioma um texto está escrito
 */
module.exports = {
    name: "detectaridioma",
    aliases: ["detectidioma","qualidioma"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Detecta em qual idioma um texto está escrito",
    cooldownMs: 3000,
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
};
