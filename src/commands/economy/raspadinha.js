/**
 * Comando .raspadinha / .scratch / .raspar
 * Raspadinha virtual com prêmios aleatórios
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const PRIZES = [
    { emoji: "💎", name: "Diamante", value: 500, chance: 0.05 },
    { emoji: "🏆", name: "Troféu", value: 200, chance: 0.1 },
    { emoji: "💰", name: "Saco de Ouro", value: 100, chance: 0.15 },
    { emoji: "🎁", name: "Presente", value: 50, chance: 0.2 },
    { emoji: "🌟", name: "Estrela", value: 25, chance: 0.25 },
    { emoji: "❌", name: "Nada", value: 0, chance: 0.25 }
];

module.exports = {
    name: "raspadinha",
    aliases: ["scratch","raspar","raspadinhas","cmd_raspadinha","alt_raspadinha","atalho_raspadinha","abrev_raspadinha","call_raspadinha","func_raspadinha"],
    category: "economy",
    subcategory: "Jogos",
    description: "Jogue raspadinha virtual e ganhe coins",
    cooldownMs: 5000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const cost = 20;
        if ((user.coins || 0) < cost) {
            return reply(`❌ *Coins insuficientes!*\n\n💰 Custo: ${cost} coins\n💰 Seu saldo: ${(user.coins || 0).toLocaleString('pt-BR')} coins`);
        }

        user.coins = (user.coins || 0) - cost;

        const roll = Math.random();
        let cumulative = 0;
        let prize = PRIZES[PRIZES.length - 1];
        for (const p of PRIZES) {
            cumulative += p.chance;
            if (roll < cumulative) {
                prize = p;
                break;
            }
        }

        if (prize.value > 0) {
            user.coins = (user.coins || 0) + prize.value;
        }

        await dataService.saveUser(user);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   🎰 *RASPADINHA* 🎰   ║\n";
        doc += "╚══════════════════════════════╝\n\n";
        doc += `🎫 *Custo:* ${cost} coins\n\n`;
        doc += `┌─────────────────────┐\n`;
        doc += `│  ${prize.emoji}  ${prize.emoji}  ${prize.emoji}  │\n`;
        doc += `│  ${prize.emoji}  ${prize.emoji}  ${prize.emoji}  │\n`;
        doc += `│  ${prize.emoji}  ${prize.emoji}  ${prize.emoji}  │\n`;
        doc += `└─────────────────────┘\n\n`;
        doc += `🎉 *Prêmio:* ${prize.name} (+${prize.value} coins)\n`;
        doc += `💰 *Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} coins\n\n`;
        doc += `💡 _Custa ${cost} coins por raspadinha!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
