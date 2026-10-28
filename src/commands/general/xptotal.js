/**
 * Comando .xptotal / .xpt / .xptodos
 * Exibe o breakdown completo de XP (grupo + privado + total)
 */

const dataService = require("../../services/dataService");
const { initializeUser, barraXP, getCargo, calcularXpNecessario } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "xptotal",
    aliases: ["xpt", "xptodos", "xpbreakdown", "xpcompleto"],
    category: "general",
    subcategory: "XP & Progressão",
    description: "Exibe o breakdown completo de XP: grupo, privado, semanal e total",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const farmGrupoMsgs = user.messagesGroup || 0;
        const farmPvMsgs = user.messagesPv || 0;
        const farmGrupoXp = user.xpGroup || 0;
        const farmPvXp = user.xpPv || 0;
        const weeklyXp = user.weeklyXp || 0;
        const level = user.level || 1;
        const currentXp = user.xp || 0;
        const maxXp = calcularXpNecessario(level);
        const barra = barraXP(currentXp, level);
        const cargo = getCargo(level);
        const totalMsgs = farmGrupoMsgs + farmPvMsgs;
        const totalCmds = (user.commandsGroup || 0) + (user.commandsPv || 0);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   📊 *XP TOTAL & BREAKDOWN* 📊   ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        doc += "╭━〔 📈 PROGRESSO GERAL 〕━⬣\n";
        doc += "┃ 📊 *Nível:* " + level + " " + barra + "\n";
        doc += "┃ ⭐ *XP Atual:* " + currentXp.toLocaleString('pt-BR') + " / " + maxXp.toLocaleString('pt-BR') + " XP\n";
        doc += "┃ 💼 *Patente:* " + cargo + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 🌐 XP POR FONTE 〕━⬣\n";
        doc += "┃ 🏠 *Grupo:* " + farmGrupoXp.toLocaleString('pt-BR') + " XP (" + farmGrupoMsgs.toLocaleString('pt-BR') + " msgs)\n";
        doc += "┃ 🔒 *Privado:* " + farmPvXp.toLocaleString('pt-BR') + " XP (" + farmPvMsgs.toLocaleString('pt-BR') + " msgs)\n";
        doc += "┃ 📅 *Semanal:* " + weeklyXp.toLocaleString('pt-BR') + " XP\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 📊 ESTATÍSTICAS 〕━⬣\n";
        doc += "┃ 💬 *Total de Mensagens:* " + totalMsgs.toLocaleString('pt-BR') + "\n";
        doc += "┃ ⌨️ *Total de Comandos:* " + totalCmds.toLocaleString('pt-BR') + "\n";
        doc += "┃ 📊 *Média XP/Mensagem:* " + (totalMsgs > 0 ? (currentXp / totalMsgs).toFixed(2) : "0") + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "💡 _Ganhe XP enviando mensagens em grupos ou no privado!_\n";
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
