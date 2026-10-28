/**
 * Comando .duelomorte / .dueloallin
 * Duelo mortal onde o vencedor leva 100% da aposta total
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "duelomorte",
    aliases: ["dueloallin", "combateaotopo", "duelototal"],
    category: "rpg",
    description: "Desafia um oponente para duelo mortal com aposta total",
    groupOnly: true,
    cooldownMs: 4000,
    execute: async ({ reply, info, sender }) => {
        const botName = getBotName();
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
        const target = contextInfo?.mentionedJid?.[0];

        if (!target) {
            return reply("❌ *Mencione o guerreiro que deseja desafiar para o duelo mortal!*\n\n📌 *Exemplo:* `.duelomorte @usuario`");
        }

        const targetNum = target.split("@")[0].split(":")[0];
        const senderNum = sender.split("@")[0].split(":")[0];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚔️ *DUELO MORTAL: ALL-IN* ⚔️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🔥 @${senderNum} desafiou @${targetNum} para um duelo mortal valendo tudo!\n`;
        doc += `💡 _Para aceitar, responda com:_ \`.aceitar\`\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender, target]);
    }
};

