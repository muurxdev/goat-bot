/**
 * Comando .shopmochila / .upgrademochila / .aumentarmochila
 * Expande os slots de inventário e capacidade da mochila
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

module.exports = {
    name: "shopmochila",
    aliases: ["upgrademochila", "aumentarmochila", "expansao"],
    category: "rpg",
    description: "Expande a capacidade e slots de armazenamento da sua mochila",
    cooldownMs: 2000,
    execute: async ({ sender, reply, text }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const currentCap = user.mochila || 20;
        const upgradeCost = Math.floor(currentCap * 75);

        if (text && (text.includes("sim") || text.includes("comprar") || text.includes("up") || text.includes("1"))) {
            if ((user.coins || 0) < upgradeCost) {
                return reply(`❌ Você precisa de *${upgradeCost.toLocaleString("pt-BR")} Coins* para expandir a mochila (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= upgradeCost;
            user.mochila = currentCap + 10;
            await dataService.saveXpData(xpData);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🎒 *MOCHILA EXPANDIDA* 🎒    ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✅ *Expansão Concluída!*\n\n`;
            doc += `📦 *Nova Capacidade:* *${user.mochila} Slots*\n`;
            doc += `💰 *Valor Pago:* ${upgradeCost.toLocaleString("pt-BR")} Coins\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    🎒 *EXPANSÃO DE MOCHILA* 🎒  ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📦 *Capacidade Atual:* *${currentCap} Slots*\n`;
        doc += `📈 *Próximo Nível:* *${currentCap + 10} Slots*\n`;
        doc += `💵 *Custo do Upgrade:* *${upgradeCost.toLocaleString("pt-BR")} Coins*\n`;
        doc += `💰 *Seu Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n\n`;
        doc += `🛒 *Para comprar agora:* Digite \`.shopmochila comprar\`\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

