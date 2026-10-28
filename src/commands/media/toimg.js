/**
 * Comando .toimg / .stickertoimg / .figtoimg
 * Converte figurinha para imagem
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "toimg",
    aliases: ["stickertoimg", "figtoimg", "fig2img"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Converte uma figurinha em imagem",
    cooldownMs: 3000,
    execute: async ({ from, sender, info, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isSticker = quotedMsg?.stickerMessage;

            if (!isSticker) {
                return reply("❌ Responda a uma figurinha para eu transformar em imagem.");
            }

            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const buffer = await downloadMediaMessage(quotedMsg, "buffer", {});

            const imageBuffer = await sharp(buffer)
                // PNG mantém a transparência da figurinha (o JPEG pintava o fundo de branco).
                .resize(1024, 1024, { fit: "contain", kernel: "lanczos3", background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png({ compressionLevel: 9 })
                .toBuffer();

            await client.sendMessage(sender, {
                image: imageBuffer,
                caption: `✅ Figurinha virou imagem.`
            });

            return;
        } catch (err) {
            logger.error("[TOIMG] Erro ao converter figurinha:", err);
            return reply("❌ Não consegui converter essa figurinha. Tente com outra.");
        }
    }
};
