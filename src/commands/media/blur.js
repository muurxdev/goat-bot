/**
 * Comando .blur / .desfocar / .borrar
 * Aplica efeito de desfoque em imagem
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "blur",
    aliases: ["desfocar", "borrar", "desfoque"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Aplica efeito de desfoque em uma imagem",
    cooldownMs: 3000,
    execute: async ({ from, sender, info, args, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = info?.message?.imageMessage || quotedMsg?.imageMessage;

            if (!isImage) {
                return reply("❌ Responda a uma imagem para eu aplicar o desfoque.");
            }

            const intensity = parseInt(args[0]) || 5;
            const sigma = Math.min(Math.max(1, intensity), 20);

            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const msgToDownload = quotedMsg || info.message;
            const buffer = await downloadMediaMessage(msgToDownload, "buffer", {});

            const blurred = await sharp(buffer)
                .blur(sigma)
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(sender, {
                image: blurred,
                caption: `✅ Desfoque aplicado · intensidade ${sigma}`
            });

            return;
        } catch (err) {
            logger.error("[BLUR] Erro ao aplicar desfoque:", err);
            return reply("❌ Não consegui aplicar o desfoque nessa imagem. Tente com outra foto.");
        }
    }
};
