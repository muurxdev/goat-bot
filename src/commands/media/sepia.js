/**
 * Comando .sepia / .antigo / .vintage
 * Aplica efeito sépia em imagem
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "sepia",
    aliases: ["antigo", "vintage", "idoso"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Aplica efeito sépia (foto antiga) em uma imagem",
    cooldownMs: 3000,
    execute: async ({ from, sender, info, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = info?.message?.imageMessage || quotedMsg?.imageMessage;

            if (!isImage) {
                return reply("❌ Responda a uma imagem para eu aplicar o efeito sépia.");
            }

            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const msgToDownload = quotedMsg || info.message;
            const buffer = await downloadMediaMessage(msgToDownload, "buffer", {});

            const sepiaBuffer = await sharp(buffer)
                .grayscale()
                .tint({ r: 112, g: 66, b: 20 })
                .modulate({ brightness: 1.1 })
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(sender, {
                image: sepiaBuffer,
                caption: `✅ Efeito sépia aplicado.`
            });

            return;
        } catch (err) {
            logger.error("[SEPIA] Erro ao aplicar sépia:", err);
            return reply("❌ Não consegui aplicar o sépia nessa imagem. Tente com outra foto.");
        }
    }
};
