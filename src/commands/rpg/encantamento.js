/**
 * Comando .encantamento / .encantararma
 * Encantamento elemental em armas com runas sagradas
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "encantamento",
    aliases: ["encantararma", "encantamentoepico", "armaencantada"],
    category: "rpg",
    description: "Aplica encantamento de fogo, gelo ou raio em seu equipamento",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    🔮 *ENCANTAMENTO REAL* 🔮    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⚡ *Sua lâmina foi encantada com Relâmpagos de Reino!*\n`;
        doc += `💥 *Efeito Adicional:* 20% de chance de paralisar o inimigo em duelo.\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

