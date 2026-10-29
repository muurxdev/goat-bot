const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .setfotogrupo / .setppgrupo
 * Altera o ícone/foto de perfil do grupo respondendo a uma imagem
 */

const { downloadWhatsAppMedia } = require("../../services/mediaService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "setfotogrupo",
    aliases: ["setppgrupo","seticongrupo","fotogrupo","icondegrupo","mudarfotogrupo","cmd_setfotogrupo","alt_setfotogrupo","atalho_setfotogrupo","abrev_setfotogrupo","call_setfotogrupo","func_setfotogrupo"],
    category: "admin",
    description: "Troca a foto do grupo pela imagem que você responder ou enviar",
    examples: [" — respondendo a uma foto, ela vira a foto do grupo"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 4000,
    execute: async ({ client, from, reply, info, type, sender }) => {
        const botName = getBotName();
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;
        const isDirectImage = type === "imageMessage";
        const isQuotedImage = Boolean(quoted?.imageMessage);

        if (!isDirectImage && !isQuotedImage) {
            return reply(
                "❌ *Responda a uma foto ou envie uma foto com a legenda:* `.setfotogrupo`\n\n" +
                "💡 *Dica:* A imagem será cortada automaticamente e definida como o novo ícone do grupo."
            );
        }

        try {
            await reply("⏳ *Processando imagem e atualizando foto do grupo...*");

            const targetWrapper = isDirectImage ? info : {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const imageBuffer = await downloadWhatsAppMedia(targetWrapper, "image", client);
            if (!imageBuffer || imageBuffer.length === 0) {
                return reply("❌ Falha ao baixar a imagem. Tente novamente.");
            }

            await client.updateProfilePicture(from, imageBuffer);
            logger.info(`[GROUP ICON] Foto de perfil do grupo ${from} atualizada por ${sender}`);

            const senderNum = sender.split("@")[0].split(":")[0];
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║ 🖼️ *FOTO DO GRUPO ATUALIZADA* 🖼️ ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✨ *O ícone do grupo foi atualizado com sucesso!*\n`;
            doc += `👤 *Atualizado por:* ${nomeDoMembro(sender)}\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        } catch (err) {
            logger.error("[SETFOTOGRUPO ERROR]", err);
            return reply("❌ Não consegui trocar a foto do grupo. Confira se a imagem abriu direito e se eu ainda sou administrador, e tente de novo.");
        }
    }
};

