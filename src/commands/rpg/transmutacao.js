/**
 * Comando .transmutacao / .transmutar
 * Transmutação de itens comuns em minérios raros
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "transmutacao",
    aliases: [ "transmutarouro", "ouroalquimico"],
    category: "rpg",
    description: "Converte pedras comuns em barras de ouro através de transmutação",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        user.coins = (user.coins || 0) + 2000;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    ⚗️ *TRANSMUTAÇÃO DE OURO* ⚗️    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *3x Barras de Ouro Puro geradas!*\n`;
        doc += `💰 *Saldo Creditado:* +2.000 coins\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

