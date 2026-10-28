/**
 * Comando .xphistory / .xph / .xphist
 * Exibe o histórico de XP ganho nas últimas 24h
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "xphistory",
    aliases: ["xph", "xphist", "xpdaily", "xphoje"],
    category: "general",
    subcategory: "XP & Progressão",
    description: "Exibe seu XP ganho hoje e streak de atividade",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const dailyXp = user.dailyXp || 0;
        const streak = user.streak || 0;
        const lastDaily = user.lastDailyClaim || 0;
        const today = new Date().toDateString();
        const lastDailyDate = lastDaily ? new Date(lastDaily).toDateString() : null;
        const claimedToday = lastDailyDate === today;

        const now = Date.now();
        const hourMs = 3600000;
        const hoursActive = Math.min(24, Math.floor((now - (user.lastSeen || now)) / hourMs));

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   📅 *HISTÓRICO DE XP* 📅   ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        doc += "╭━〔 📊 XP DE HOJE 〕━⬣\n";
        doc += "┃ ✨ *XP Ganho Hoje:* " + dailyXp.toLocaleString('pt-BR') + " XP\n";
        doc += "┃ 🔥 *Streak de Atividade:* " + streak + " dias\n";
        doc += "┃ 📅 *Daily Resgatado:* " + (claimedToday ? "✅ Sim" : "❌ Não") + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 📈 ATIVIDADE RECENTE 〕━⬣\n";
        doc += "┃ 👁️ *Última Atividade:* " + (hoursActive > 0 ? hoursActive + "h atrás" : "Agora mesmo") + "\n";
        doc += "┃ 💬 *Mensagens Hoje:* " + (user.messagesToday || 0).toLocaleString('pt-BR') + "\n";
        doc += "┃ ⌨️ *Comandos Hoje:* " + (user.commandsToday || 0).toLocaleString('pt-BR') + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        if (!claimedToday) {
            doc += "💡 _Resgate seu daily com_ `.daily` _para ganhar XP extra!_\n";
        } else {
            doc += "💡 _Continue enviando mensagens para manter o streak!_\n";
        }
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
