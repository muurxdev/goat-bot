/**
 * Comando .tarot / .cartas-tarot
 * Tiragem diária de cartas de Tarô arcano com bênçãos cósmicas, bônus de XP e recompensas
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const TAROT_CARDS = [
    { carta: "☀️ XIX - O Sol", significado: "Triunfo absoluto e bênção de Herói", xp: 1200, coins: 1500, buff: "+25% Dano Crítico por 2h" },
    { carta: "🌑 XVIII - A Lua", significado: "Mistérios profundos e revelações arcanas", xp: 800, coins: 900, buff: "+15% Esquiva" },
    { carta: "⭐ XVII - A Estrela", significado: "Esperança e cura divina de Princesa", xp: 950, coins: 1100, buff: "Cura 100% de HP Imediatamente" },
    { carta: "🧙 I - O Mago", significado: "Domínio elemental e sabedoria de Mago", xp: 1500, coins: 2000, buff: "+50% XP nas próximas batalhas" },
    { carta: "👑 IV - O Imperador", significado: "Autoridade militar e poder inabalável", xp: 1100, coins: 2500, buff: "+100 CP Poder de Combate" },
    { carta: "🃏 0 - O Louco", significado: "Novo ciclo de aventuras e surpresas imprevisíveis", xp: 2000, coins: 3000, buff: "Sorte Suprema" }
];

module.exports = {
    name: "tarot",
    aliases: ["cartastarot", "tirartarot", "arcanos", "tarot-diario"],
    category: "rpg",
    description: "Tire uma carta do Tarô Arcano para receber bênçãos diárias e recompensas cósmicas",
    cooldownMs: 60000, // Cooldown de 1 minuto
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sorteada = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];

        const { xpGanho, lvlRes } = adicionarXp(user, sorteada.xp, { source: "rpg" });
        user.coins = (user.coins || 0) + sorteada.coins;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔮 *ORÁCULO DO TARÔ ARCANO* 🔮   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *O destino desdobrou as cartas sobre a mesa de Mago...*\n\n`;
        doc += `╭━〔 🃏 CARTA REVELADA 〕━⬣\n`;
        doc += `┃ 🎴 *Carta:* *${sorteada.carta}*\n`;
        doc += `┃ 📜 *Presságio:* _"${sorteada.significado}"_\n`;
        doc += `┃ 🌟 *Bênção Concedida:* ${sorteada.buff}\n`;
        doc += `┃ ⭐ *XP Obtido:* +${xpGanho.toLocaleString("pt-BR")} XP\n`;
        doc += `┃ 💰 *Coins Coletados:* +${sorteada.coins.toLocaleString("pt-BR")} Coins\n`;
        if (lvlRes.subiu) doc += `┃ 🆙 *Subiu de nível!* Agora nível ${user.level}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Volte periodicamente para consultar novamente as profecias do destino!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
