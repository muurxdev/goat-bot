/**
 * Comando .pocaoimunidade / .antimaldicao
 * Poção de imunidade contra maldições demoníacas
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "pocaoimunidade",
    aliases: ["antimaldicao", "pocaoescudo", "imunidaderpg"],
    category: "rpg",
    description: "Concede imunidade a debuffs e maldições por 12 horas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🧪 *POÇÃO DE IMUNIDADE* 🧪   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Elixir da Imunidade Consumido!*\n`;
        doc += `🛡️ Você está 100% protegido contra efeitos de veneno e fogo negro por 12h.\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

