/**
 * Comando .roletarussa
 * Jogo de azar clássico com tambor giratório e aposta
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

module.exports = {
    name: "roletarussa",
    aliases: ["roletaazar", "revolver", "russianroulette"],
    category: "fun",
    description: "Gire o tambor do revólver de 6 câmaras e puxe o gatilho",
    cooldownMs: 10000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const chamber = Math.floor(Math.random() * 6) + 1; // 1 a 6
        const bullet = Math.floor(Math.random() * 6) + 1;

        if (chamber === bullet) {
            const lostCoins = Math.min(Number(user.coins || 0), 200);
            user.coins = Math.max(0, (user.coins || 0) - lostCoins);
            dataService.saveUser(user);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║     💥 *BANG! VOCÊ MORREU* 💥   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `🔫 *Gatilho puxado na câmara:* [${chamber}/6]\n`;
            doc += `💥 A bala disparou bem na sua cabeça!\n`;
            doc += `💸 *Moedas Perdidas:* -${lostCoins} Coins\n\n`;
            doc += `☠️ _Você renasceu na taberna com dor de cabeça..._`;
            return reply(doc.trim());
        }

        const winCoins = 150;
        user.coins = (user.coins || 0) + winCoins;
        dataService.saveUser(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║     😅 *CLIQUE! VOCÊ VIVEU* 😅   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🔫 *Gatilho puxado na câmara:* [${chamber}/6]\n`;
        doc += `✨ A câmara estava vazia! Você sobreviveu à roleta russa!\n`;
        doc += `💰 *Prêmio de Coragem:* +${winCoins} Coins!\n\n`;
        doc += `🍀 _Sua sorte ainda está intacta!_`;

        return reply(doc.trim());
    }
};

