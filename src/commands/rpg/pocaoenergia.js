/**
 * Comando .pocaoenergia / .recargastamina
 * Poção de restauração imediata de energia de batalha
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "pocaoenergia",
    aliases: ["recargastamina", "estamina", "energiatotal", "pocaoestamina"],
    category: "rpg",
    description: "Recarrega 100% da estamina e energia para batalhas consecutivas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚡ *POÇÃO DE ENERGIA* ⚡   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🧪 *Estamina 100% recarregada!* Você está pronto para batalhar sem limites na masmorra.\n\n`;
        doc += `👑 *${botName}*`;
        return reply(doc.trim());
    }
};

