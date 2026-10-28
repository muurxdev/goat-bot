/**
 * Comando .iaver / .lerimagem / .descrever
 * Inteligência Artificial e Reconhecimento Visual de Imagens
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { analyzeImage } = require("../../services/aiService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")
const moldura = require("../../utils/moldura")

module.exports = {
    name: "iaver",
    aliases: ["lerimagem", "iafoto", "descrever", "vision", "iaimagem", "analisarimagem", "ocr", "fotoia", "verfoto"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Analisa, lê textos (OCR) e descreve imagens enviadas com Inteligência Artificial Vision",
    cooldownMs: 4000,
    execute: async ({ info, type, from, client, reply, text, quotedText }) => {
        const botName = getBotName()
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const isImage = type === "imageMessage"
        const isQuotedImage = !!quoted?.imageMessage

        if (!isImage && !isQuotedImage) {
            return reply("❌ Envie ou responda a uma imagem com `.iaver [pergunta ou instrução]`\n\n📌 *Exemplos:*\n• `.iaver O que está acontecendo nesta foto?`\n• `.iaver leia o texto presente na imagem`\n• `.iaver resolva a questão da foto`\n• `.ocr — extrai todo o texto da imagem`")
        }

        const prompt = (text || quotedText || "Analise e descreva detalhadamente esta imagem. Se houver texto, transcreva-o. Se for uma questão, resolva.").trim()
        const imgMsg = isImage ? info.message.imageMessage : quoted.imageMessage

        await reply("🧠 *IA Vision:* _Processando imagem com Inteligência Artificial e OCR..._ Aguarde.")

        try {
            const stream = await downloadContentFromMessage(imgMsg, "image")
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            const sizeKb = Math.round(buffer.length / 1024)
            const mimetype = imgMsg.mimetype || "image/jpeg"

            // Consulta IA Vision com o buffer real da imagem
            const aiResponse = await analyzeImage(buffer, mimetype, prompt)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║    👁️ *GOAT IA VISION* 👁️    ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `📌 *Pergunta / Instrução:* _"${prompt.slice(0, 100)}"_\n`
            doc += `📦 *Mídia:* Imagem (${sizeKb} KB | ${mimetype})\n\n`

            const textoDaIA = String(aiResponse ?? '').trim() || '_A IA não devolveu resposta para esta imagem._'
            doc += `${moldura.secao('🧠', 'ANÁLISE VISUAL & OCR', [textoDaIA])}\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        } catch (err) {
            logger.error("[IA VISION ERROR]", err)
            return reply("😕 *Não consegui analisar essa imagem agora.*\n\nTente de novo em instantes, respondendo à imagem com o comando. Se persistir, mande a foto de novo em outro formato.")
        }
    }
}
