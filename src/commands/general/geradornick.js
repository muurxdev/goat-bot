/**
 * Comando .geradornick
 * Gera nicks estilizados com símbolos e fontes Unicode raras
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "geradornick",
    aliases: ["nickpersonalizado", "fontesnick", "estilonick"],
    category: "general",
    description: "Gera nicks estilizados com símbolos e fontes Unicode raras",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const nome = args.join(" ").trim() || sender.split("@")[0];
    return reply("✨ *NICKS ESTILIZADOS GERADOS:*\n\n1. ꧁ঔৣ☬" + nome + "☬ঔৣ꧂\n2. ⚡ ṂＥŁＩＯＤＡＳ • " + nome + " ⚡\n3. 🐉 𝕸𝖊𝖑𝖎𝖔𝖉𝖆𝖘 - " + nome + " 🐉\n4. 亗 " + nome.toUpperCase() + " 亗");
}
};
