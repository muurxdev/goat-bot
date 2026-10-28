/**
 * Comando .apostar / .bet / .aposta
 * Sistema de apostas simples com emoções
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "apostar",
    aliases: ["bet","aposta","fazeraposta","cmd_apostar","alt_apostar","atalho_apostar","abrev_apostar","call_apostar","func_apostar"],
    category: "economy",
    subcategory: "Jogos",
    description: "Faça uma aposta e tente multiplicar seus coins",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
            return reply("❌ *Informe um valor para apostar!*\n\n📌 *Exemplo:* `.apostar 100`");
        }

        if (amount > (user.coins || 0)) {
            return reply(`❌ *Saldo insuficiente!*\n\n💰 Seu saldo: ${(user.coins || 0).toLocaleString('pt-BR')} coins`);
        }

        const multiplier = Math.random();
        let result;
        let winAmount;

        if (multiplier < 0.3) {
            result = "💥 *PERDEU!*";
            winAmount = -amount;
        } else if (multiplier < 0.6) {
            result = "😐 *EMPATOU!*";
            winAmount = 0;
        } else if (multiplier < 0.85) {
            const mult = 1.5 + Math.random() * 0.5;
            winAmount = Math.floor(amount * mult);
            result = `🎉 *GANHOU ${mult.toFixed(1)}x!*`;
        } else {
            const mult = 2 + Math.random() * 3;
            winAmount = Math.floor(amount * mult);
            result = `🚀 *JACKPOT ${mult.toFixed(1)}x!*`;
        }

        user.coins = (user.coins || 0) + winAmount;
        await dataService.saveUser(user);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   🎰 *APOSTA REALIZADA* 🎰   ║\n";
        doc += "╚══════════════════════════════╝\n\n";
        doc += `💰 *Aposta:* ${amount.toLocaleString('pt-BR')} coins\n`;
        doc += `${result}\n`;
        doc += `💵 *Resultado:* ${winAmount >= 0 ? '+' : ''}${winAmount.toLocaleString('pt-BR')} coins\n`;
        doc += `🏦 *Saldo Atual:* ${(user.coins || 0).toLocaleString('pt-BR')} coins\n\n`;
        doc += `💡 _Tente a sorte novamente!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
