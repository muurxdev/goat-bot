/**
 * Comando .reforja / .reforjar
 * Reforja ancestral de atributos e status adicionais de armas
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "reforja",
    aliases: ["reforjar", "rerollstatus", "reforjaancestral"],
    category: "rpg",
    description: "Reforja atributos adicionais de seus equipamentos de combate",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        const cost = 1200;
        if ((user.coins || 0) < cost) {
            return reply(`⚠️ Você precisa de ${cost} coins para reforjar seus atributos.`);
        }

        user.coins -= cost;
        const newBonus = Math.floor(Math.random() * 20 + 15); // +15% a +35%
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚒️ *REFORJA ANCESTRAL* ⚒️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🔥 *Equipamento reforjado com fogo divino!*\n\n`;
        doc += `╭━〔 ⚔️ NOVOS ATRIBUTOS ROLADOS 〕━⬣\n`;
        doc += `┃ 💥 *Bônus de Perfuração:* +${newBonus}%\n`;
        doc += `┃ 🛡️ *Resistência Mágica:* +18%\n`;
        doc += `┃ 💰 *Custo da Reforja:* -${cost} coins\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

