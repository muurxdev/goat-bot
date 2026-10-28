/**
 * Comando .pescaepica / .pescar-raro
 * Pescaria mística de monstros marinhos e tesouros submersos
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const CATCHES = [
    { name: "Peixe Dourado Místico", reward: 900, xp: 200 },
    { name: "Serpente das Profundezas", reward: 2200, xp: 600 },
    { name: "Baú Submerso com Moedas Antigas", reward: 4500, xp: 1200 },
    { name: "Bota Velha Encharcada", reward: 50, xp: 20 }
];

module.exports = {
    name: "pescaepica",
    aliases: ["pescarmagico", "pescar-raro", "pescamistica"],
    category: "rpg",
    description: "Pesca monstros marinhos lendários e baús do tesouro no lago mágico",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const item = CATCHES[Math.floor(Math.random() * CATCHES.length)];
        user.coins = (user.coins || 0) + item.reward;
        const { xpGanho, lvlRes } = adicionarXp(user, item.xp, { source: "rpg" });
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🎣 *PESCARIA ÉPICA* 🎣   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🌊 *Você puxou a linha e capturou:* *${item.name}*!\n\n`;
        doc += `╭━〔 🎁 DESPOJOS DA PESCA 〕━⬣\n`;
        doc += `┃ 💰 *Coins:* +${item.reward.toLocaleString("pt-BR")} coins\n`;
        doc += `┃ ⭐ *XP de Pesca:* +${xpGanho.toLocaleString("pt-BR")} XP\n`;
        if (lvlRes.subiu) doc += `┃ 🆙 *Subiu de nível!* Agora nível ${user.level}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

