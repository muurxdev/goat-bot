/**
 * Comando .reliquiamagica / .usarreliquia
 * Ativa poderes ocultos de relíquias mágicas
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "reliquiamagica",
    aliases: ["usarreliquia", "ativarreliquia", "reliquiaspoder"],
    category: "rpg",
    description: "Canaliza e ativa o poder oculto de suas relíquias sagradas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   💎 *PODER DA RELÍQUIA* 💎   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *O Chifre de Cernunnos ressoou com força ancestral!*\n`;
        doc += `🛡️ *Todos os aliados no grupo receberam +20% HP Máximo!*\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

