/**
 * Comando .nobg / .removerbg / .removebg
 * Remove o fundo de imagens
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "nobg",
    aliases: ["removerbg", "removebg", "semfundo"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Converte uma imagem para PNG (ainda não remove o fundo)",
    cooldownMs: 5000,
    execute: async ({ from, sender, info, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = info?.message?.imageMessage || quotedMsg?.imageMessage;

            if (!isImage) {
                return reply("❌ Responda a uma imagem para eu converter para PNG.");
            }

            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const msgToDownload = quotedMsg || info.message;
            const buffer = await downloadMediaMessage(msgToDownload, "buffer", {});

            const pngBuffer = await sharp(buffer)
                .png()
                .toBuffer();

            await client.sendMessage(sender, {
                image: pngBuffer,
                caption: `✅ Aqui está em PNG. Remover o fundo de verdade eu ainda não sei fazer.`
            });

            return;
        } catch (err) {
            logger.error("[NOBG] Erro ao remover fundo:", err);
            return reply("❌ Não consegui converter essa imagem. Tente com outra foto.");
        }
    }
};
