/**
 * Comando .emboscada / .ataquesurpresa
 * Evento surpresa de emboscada no chat com monstros lendários
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "emboscada",
    aliases: ["ataquesurpresa", "emboscar", "eventoemboscada"],
    category: "rpg",
    description: "Inicia um evento de emboscada súbita no chat em grupo",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        const coinsReward = 1500;
        user.coins = (user.coins || 0) + coinsReward;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚔️ *EMBOSCADA NO CAMINHO!* ⚔️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🐺 *Uma alcateia de Demônios Vermelhos atacou o grupo!*\n`;
        doc += `Você reagiu instantaneamente e eliminou as ameaças!\n\n`;
        doc += `💰 *Despojos Coletados:* +${coinsReward.toLocaleString("pt-BR")} coins\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

