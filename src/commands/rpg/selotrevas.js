/**
 * Comando .selotrevas / .chamasnegras
 * Liberação do Selo das Chamas Negras do Clã dos Demônios
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "selotrevas",
    aliases: [ "marcademonica", "purgatoriopoder"],
    category: "rpg",
    description: "Libera as chamas negras do purgatório aumentando o poder de ataque",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const { xpGanho, lvlRes } = adicionarXp(user, 800, { source: "rpg" });
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔥 *SELO DAS CHAMAS NEGRAS* 🔥   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🌑 *As marcas demoníacas cobriram seu corpo!*\n\n`;
        doc += `╭━〔 ⚔️ PODER DO PURGATÓRIO 〕━⬣\n`;
        doc += `┃ 💥 *Ataque Físico:* +45% de Dano\n`;
        doc += `┃ 🔥 *Habilidade:* Chamas do Inferno (Hellblaze Ativo)\n`;
        doc += `┃ ⭐ *Experiência:* +${xpGanho.toLocaleString("pt-BR")} XP\n`;
        if (lvlRes.subiu) doc += `┃ 🆙 *Subiu de nível!* Agora nível ${user.level}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

