/**
 * Comando .setdesc / .setbio / .setdescricao
 * Altera a descrição/bio do grupo diretamente pelo WhatsApp
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "setdesc",
    aliases: ["setbio","descgrupo","mudardesc","setdescricao","biogrupo","desc","cmd_setdesc","alt_setdesc","atalho_setdesc","abrev_setdesc","call_setdesc","func_setdesc"],
    category: "admin",
    description: "Muda a descrição do grupo (preciso ser administrador)",
    usage: "<texto>",
    examples: ["Grupo de leitura, sem spam — define a descrição", " — respondendo a uma mensagem, usa o texto dela"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, text, reply, sender, quotedText }) => {
        const newDesc = (text || quotedText || "").trim();
        const botName = getBotName();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (!newDesc) {
            return reply(
                "❌ *Informe o novo texto da descrição/bio do grupo!*\n\n" +
                "📌 *Exemplo:* `.setdesc Regras do grupo:\n1. Proibido spam\n2. Respeite todos`\n\n" +
                "💡 *Dica:* Você também pode responder a qualquer mensagem com `.setdesc` para defini-la como descrição!"
            );
        }

        try {
            await client.groupUpdateDescription(from, newDesc);
            logger.info(`[GROUP DESC] Descrição de ${from} atualizada por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║ 📝 *DESCRIÇÃO DO GRUPO ATUALIZADA* ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 📜 NOVA BIO / REGRAS 〕━⬣\n`;
            doc += `${String(newDesc.slice(0, 300) + (newDesc.length > 300 ? "\n..." : "")).split('\n').map(l => '┃ ' + l).join('\n')}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👤 *Alterado por:* @${senderNum}\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        } catch (err) {
            logger.error("[SETDESC ERROR]", err);
            return reply("❌ Não consegui mudar a descrição do grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.");
        }
    }
};

