/**
 * Comando .explicar — Explica um assunto de forma simples e didática
 */

const { askAI } = require('../../services/aiService')
const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: "explicar",
    aliases: ["explique", "eli5"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Explica um assunto de forma simples e didática",
    cooldownMs: 3000,
    execute: async ({ text, reply }) => {
        const q = String(text || '').trim()
        if (!q) return reply('🧠 *Explicar*\n\nUso: `.explicar <assunto>`')

        const botName = getBotName()
        try {
            const resposta = await askAI('Explique de forma simples, didática e clara: ' + q)
            if (!resposta) return reply('❌ Não consegui explicar isso no momento.')

            let doc = `╔══════════════════════════════╗\n`
            doc += `║       🧠 *EXPLICAÇÃO* 🧠       ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 _"${q.slice(0, 80)}"_\n\n`
            doc += `╭━〔 💡 CONTEÚDO 〕━⬣\n`
            doc += `${resposta}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        } catch (e) {
            return reply('❌ Não consegui explicar isso no momento.')
        }
    }
}
