/**
 * Comando .take / .roubarfig
 * Altera os metadados EXIF de uma figurinha (Nome do Pacote e Autor)
 */

const { downloadWhatsAppMedia, criarFigurinha, converterFigurinhaParaMidia } = require("../../services/mediaService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "take",
    aliases: ["roubarfig", "wm", "stickerwm", "renomearfig", "clonarfig"],
    category: "media",
    description: "Altera o pacote e o autor dos metadados de uma figurinha",
    cooldownMs: 2000,
    execute: async ({ info, type, from, client, reply, text }) => {
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;
        const isSticker = type === "stickerMessage";
        const isQuotedSticker = !!quoted?.stickerMessage;

        if (!isSticker && !isQuotedSticker) {
            return reply("❌ Responda a uma figurinha com \`.take <pacote> | <autor>\` para mudar os créditos da figurinha.");
        }

        const stickerMsg = isSticker ? info.message.stickerMessage : quoted.stickerMessage;
        const isAnimated = !!stickerMsg?.isAnimated;

        let packName = getBotName();
        let authorName = getBotName();

        if (text && text.trim()) {
            const parts = text.split("|");
            if (parts[0]) packName = parts[0].trim();
            if (parts[1]) authorName = parts[1].trim();
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const targetWrapper = isSticker ? info : {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const buffer = await downloadWhatsAppMedia(targetWrapper, "sticker", client);
            const media = await converterFigurinhaParaMidia(buffer);
            const newStickerBuf = await criarFigurinha(media.buffer, isAnimated || media.type === "video", packName, authorName);

            await client.sendMessage(from, {
                sticker: newStickerBuf
            }, { quoted: info });

            logger.info("[TAKE COMMAND] Metadados da figurinha atualizados por " + info.key.participant);
        } catch (err) {
            logger.error("[TAKE ERROR]", err);
            return reply("❌ Não consegui trocar os créditos dessa figurinha. Tente com outra.");
        }
    }
};
