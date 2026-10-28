/**
 * Comando .meme
 * Gerador Automático de Memes em Imagens com FFmpeg
 */

const fs = require("fs")
const path = require("path")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { spawn } = require("child_process")
const { tempDir } = require("../../config/paths")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

module.exports = {
    name: "meme",
    aliases: ["gerarmeme", "mememaker", "criar-meme"],
    category: "media",
    description: "Cria um meme com texto superior e inferior em uma imagem enviada ou respondida",
    cooldownMs: 3000,
    execute: async ({ info, type, from, client, reply, text }) => {
        const botName = getBotName()
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const isImage = type === "imageMessage"
        const isQuotedImage = !!quoted?.imageMessage

        if (!isImage && !isQuotedImage) {
            return reply("❌ Mande ou responda a uma imagem com `.meme <texto de cima> | <texto de baixo>`.\nExemplo: `.meme quando o código | compila de primeira`")
        }

        if (!text || !text.trim()) {
            return reply("❌ Faltou o texto do meme. Exemplo: `.meme texto de cima | texto de baixo`")
        }

        const parts = text.split("|")
        const topText = (parts[0] || "").trim().toUpperCase().replace(/['"`:\\]/g, "")
        const bottomText = (parts[1] || "").trim().toUpperCase().replace(/['"`:\\]/g, "")

        const imgMsg = isImage ? info.message.imageMessage : quoted.imageMessage

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(imgMsg, "image")
            let inBuf = Buffer.from([])
            for await (const chunk of stream) {
                inBuf = Buffer.concat([inBuf, chunk])
            }

            const inPath = path.join(tempDir, "meme_in_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6) + ".jpg")
            const outPath = path.join(tempDir, "meme_out_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6) + ".jpg")

            fs.writeFileSync(inPath, inBuf)

            // Monta filtros FFmpeg drawtext
            const filters = []
            if (topText) {
                filters.push("drawtext=text='" + topText + "':fontcolor=white:fontsize=36:borderw=3:bordercolor=black:x=(w-text_w)/2:y=20")
            }
            if (bottomText) {
                filters.push("drawtext=text='" + bottomText + "':fontcolor=white:fontsize=36:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-20")
            }

            const filterStr = filters.join(",") || "null"

            await new Promise((resolve, reject) => {
                const ff = spawn("ffmpeg", [
                    "-y",
                    "-i", inPath,
                    "-vf", filterStr,
                    "-q:v", "2",
                    outPath
                ])
                ff.on("close", code => {
                    if (code === 0 && fs.existsSync(outPath)) resolve()
                    else reject(new Error("FFmpeg finalizou com código " + code))
                })
                ff.on("error", reject)
            })

            const outBuf = fs.readFileSync(outPath)

            try { fs.unlinkSync(inPath) } catch (errIgnorado) { logger.warn(`[MEME] Falha ignorada em src/commands/media/meme.js:82: ${errIgnorado.message}`) }
            try { fs.unlinkSync(outPath) } catch (errIgnorado) { logger.warn(`[MEME] Falha ignorada em src/commands/media/meme.js:83: ${errIgnorado.message}`) }

            await client.sendMessage(from, {
                image: outBuf,
                caption: "🎭 Meme pronto."
            }, { quoted: info })

        } catch (err) {
            logger.error("[MEME ERROR]", err)
            return reply("❌ Não consegui montar o meme com essa imagem. Tente outra foto ou um texto mais curto.")
        }
    }
}
