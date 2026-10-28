/**
 * Comando .muralrecompensas / .bounties
 * Mural geral de criminosos e alvos procurados com recompensa
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "muralrecompensas",
    aliases: ["bounties", "procuradosrpg", "cartazesbounty"],
    category: "rpg",
    description: "Exibe todos os alvos e monstros com cabeças a prêmio no reino",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📜 *MURAL DE PROCURADOS* 📜   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `1. 👹 Albino Gigante de Edinburgh ➔ 15.000 Coins\n`;
        doc += `2. 🐺 Fenrir do Vale Glacial ➔ 28.000 Coins\n`;
        doc += `3. 🐉 Dragão Tiamat ➔ 60.000 Coins\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

