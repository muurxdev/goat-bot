/**
 * Comando .minerar
 * Mineração de jazidas profundas para extração de carvão, ouro, diamantes e fragmentos
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");

const ORES = [
    { name: "🪨 Minério de Ferro Bruto", value: 50, xp: 35, icon: "🪨" },
    { name: "🪙 Pepita de Ouro Puro", value: 120, xp: 75, icon: "🪙" },
    { name: "💎 Diamante Brilhante", value: 280, xp: 160, icon: "💎" },
    { name: "🔮 Fragmento de Orichalcum Divino", value: 750, xp: 450, icon: "🔮" }
];

module.exports = {
    name: "minerar",
    aliases: ["mine","mineracao","garimpar","mina","cmd_minerar","alt_minerar","atalho_minerar","abrev_minerar","call_minerar","func_minerar"],
    category: "economy",
    description: "Minere minérios raros e pedras preciosas nas cavernas do Reino",
    cooldownMs: 15000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const roll = Math.random();
        let ore = null;

        if (roll < 0.08) ore = ORES[3]; // 8% Orichalcum
        else if (roll < 0.25) ore = ORES[2]; // 17% Diamante
        else if (roll < 0.55) ore = ORES[1]; // 30% Ouro
        else ore = ORES[0]; // 45% Ferro

        user.coins = (user.coins || 0) + ore.value;
        const { xpGanho, lvlRes } = adicionarXp(user, ore.xp, { source: "rpg" });
        dataService.saveUser(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║      ⛏️ *MINERAÇÃO REAL* ⛏️     ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⛏️ *Sua picareta quebrou a rocha profunda e encontrou:* \n\n`;
        doc += `👉 ✨ *${ore.name}* ✨\n\n`;
        doc += `💰 *Valor de Venda:* +${ore.value} Coins\n`;
        doc += `⭐ *XP de Mineração:* +${xpGanho} XP\n`;
        if (lvlRes.subiu) doc += `🆙 *Subiu de nível!* Agora nível ${user.level}\n`;
        doc += `🪙 *Novo Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n\n`;
        doc += `🔥 _Guarde moedas para aprimorar seus equipamentos no \`.forjar\`!_`;

        return reply(doc.trim());
    }
};

