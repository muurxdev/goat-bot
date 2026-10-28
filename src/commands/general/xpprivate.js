/**
 * Comando .xpprivate / .xppv / .xppri
 * Exibe o XP acumulado no privado (farm passivo)
 */

const dataService = require("../../services/dataService");
const { initializeUser, barraXP, getCargo, calcularXpNecessario } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "xpprivate",
    aliases: ["xppv", "xppri", "xpprivado", "xpdm"],
    category: "general",
    subcategory: "XP & Progressão",
    description: "Exibe seu XP acumulado no privado (farm passivo por mensagens)",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const farmPvMsgs = user.messagesPv || 0;
        const farmPvXp = user.xpPv || 0;
        const farmComandos = user.commandsPv || 0;
        const level = user.level || 1;
        const currentXp = user.xp || 0;
        const maxXp = calcularXpNecessario(level);
        const barra = barraXP(currentXp, level);
        const cargo = getCargo(level);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   📊 *XP NO PRIVADO* 📊   ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        doc += "╭━〔 🔒 FARM PRIVADO 〕━⬣\n";
        doc += "┃ 💬 *Mensagens no Privado:* " + farmPvMsgs.toLocaleString('pt-BR') + "\n";
        doc += "┃ ⌨️ *Comandos no Privado:* " + farmComandos.toLocaleString('pt-BR') + "\n";
        doc += "┃ ✨ *XP Ganho no Privado:* " + farmPvXp.toLocaleString('pt-BR') + " XP\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 📈 PROGRESSO TOTAL 〕━⬣\n";
        doc += "┃ 📊 *Nível:* " + level + " " + barra + "\n";
        doc += "┃ ⭐ *XP Atual:* " + currentXp.toLocaleString('pt-BR') + " / " + maxXp.toLocaleString('pt-BR') + " XP\n";
        doc += "┃ 💼 *Patente:* " + cargo + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "💡 _No privado você também ganha XP conversando comigo!_\n";
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
