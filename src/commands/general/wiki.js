/**
 * Comando .wiki / .wikipedia
 * Consulta enciclopédica na Wikipédia em português
 */

const { searchWiki } = require("../../services/aiService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

module.exports = {
    name: "wiki",
    aliases: ["wikipedia", "enciclopedia", "artigo", "wikipédia"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Pesquisa verbetes e artigos na Wikipédia em português",
    cooldownMs: 3000,
    execute: async ({ text, args = [], reply, quotedText }) => {
        const query = (text || quotedText || args.join(" ")).trim()
        const botName = getBotName()

        if (!query) {
            return reply("📚 *ENCICLOPÉDIA WIKIPÉDIA*\n\nDigite o assunto que deseja consultar.\n\n📌 *Exemplo:* `.wiki Buraco Negro` ou `.wiki Santos Dumont`")
        }

        try {
            const res = await searchWiki(query)
            if (!res) {
                return reply(`❌ Não encontrei nenhum artigo correspondente a _"${query}"_. Tente termos mais específicos.`)
            }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📚 *ENCICLOPÉDIA WIKIPÉDIA* 📚  ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📖 *${res.title}*\n\n`
            doc += `${res.extract.trim()}\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        } catch (err) {
            logger.error("[WIKI COMMAND ERROR]", err)
            return reply("😕 *Não consegui consultar a Wikipédia agora.*\n\nTente de novo em instantes ou pesquise com outro termo.")
        }
    }
}
