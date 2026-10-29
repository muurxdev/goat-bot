/**
 * Comando .cacaaotesouro / .tesourochat
 * Esconde um baú de moedas no chat e premia o primeiro participante que resgatar
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "cacaaotesouro",
    aliases: ["tesourochat","bautesouro","resgatarbau","abrirbau","cmd_cacaaotesouro","alt_cacaaotesouro","atalho_cacaaotesouro","abrev_cacaaotesouro","call_cacaaotesouro","func_cacaaotesouro"],
    category: "economy",
    description: "Inicia uma caça ao tesouro com baú de moedas no chat",
    cooldownMs: 8000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        const reward = Math.floor(Math.random() * 800 + 400);
        user.coins = (user.coins || 0) + reward;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏴‍☠️ *BAÚ DO TESOURO ABERTO* 🏴‍☠️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ Você encontrou e abriu um baú secreto deixado pelo Capitão ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤!\n\n`;
        doc += `╭━〔 💰 CONTEÚDO DO BAÚ 〕━⬣\n`;
        doc += `┃ 💰 *Moedas Resgatadas:* +${reward.toLocaleString("pt-BR")} coins\n`;
        doc += `┃ 💎 *Gemas Raras:* +2 Pérolas de Reino\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

