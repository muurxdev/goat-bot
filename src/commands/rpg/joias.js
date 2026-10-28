/**
 * Comando .joias / .engastar
 * Cravação e engaste de gemas mágicas em equipamentos
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "joias",
    aliases: ["engastar", "gemas", "pedraspreciosas", "socketgems"],
    category: "rpg",
    description: "Engasta joias mágicas e gemas elementais em suas armas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   💎 *ENGASTE DE JOIAS & GEMAS* 💎   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🔮 GEMAS DISPONÍVEIS 〕━⬣\n`;
        doc += `┃ 🔴 Rubi do Dragão (+500 Dano de Fogo)\n`;
        doc += `┃ 🔵 Safira Celestial (+300 Escudo Mágico)\n`;
        doc += `┃ 🟢 Esmeralda da Floresta (+200 Regeneração/s)\n`;
        doc += `┃ 🟣 Ametista do Vazio (+15% Dano Crítico)\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

