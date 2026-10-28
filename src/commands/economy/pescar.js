/**
 * Comando .pescar
 * Minigame de pescaria com peixes comuns, raros, lendários e venda de espólios
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");

const FISHES = [
    { name: "🐟 Sardinha do Lago", price: 40, xp: 25, rarity: "Comum" },
    { name: "🐠 Peixe-Palhaço Dourado", price: 85, xp: 50, rarity: "Incomum" },
    { name: "🐡 Baiacu Espinhoso", price: 150, xp: 90, rarity: "Raro" },
    { name: "🦈 Tubarão Abissal do Reino", price: 350, xp: 220, rarity: "Épico" },
    { name: "🐉 Leviatã Mítico das Águas Profundas", price: 900, xp: 600, rarity: "Lendário" }
];

module.exports = {
    name: "pescar",
    aliases: ["fish","pescaria","pescador","cmd_pescar","alt_pescar","atalho_pescar","abrev_pescar","call_pescar","func_pescar"],
    category: "economy",
    description: "Lance sua vara de pesca no lago sagrado e capture peixes valiosos",
    cooldownMs: 15000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const roll = Math.random();
        let fish = null;

        if (roll < 0.05) fish = FISHES[4]; // 5% Lendário
        else if (roll < 0.15) fish = FISHES[3]; // 10% Épico
        else if (roll < 0.35) fish = FISHES[2]; // 20% Raro
        else if (roll < 0.65) fish = FISHES[1]; // 30% Incomum
        else fish = FISHES[0]; // 35% Comum

        user.coins = (user.coins || 0) + fish.price;
        const { xpGanho, lvlRes } = adicionarXp(user, fish.xp, { source: "rpg" });
        dataService.saveUser(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║       🎣 *PESCARIA REAL* 🎣      ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🎣 *Você jogou a isca nas águas sagradas e fisgou:* \n\n`;
        doc += `👉 ✨ *${fish.name}* ✨\n\n`;
        doc += `💎 *Raridade:* ${fish.rarity}\n`;
        doc += `💰 *Vendido por:* +${fish.price} Coins\n`;
        doc += `⭐ *XP de Pesca:* +${xpGanho} XP\n`;
        if (lvlRes.subiu) doc += `🆙 *Subiu de nível!* Agora nível ${user.level}\n`;
        doc += `🪙 *Novo Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n\n`;
        doc += `💡 _Lance a linha novamente em instantes!_`;

        return reply(doc.trim());
    }
};

