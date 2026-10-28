/**
 * Comando .divorciofake
 * Partilha de bens e divórcio fictício no grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "divorciofake",
    aliases: ["divorciar", "separacao", "partilhabens"],
    category: "fun",
    description: "Partilha de bens e divórcio fictício no grupo",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    return reply("💔 *DIVÓRCIO CONCLUÍDO!*\n\n📜 @" + sender.split("@")[0] + " assinou a papelada de separação amigável. A casa fica com o gato e os Coins foram divididos meio a meio!", [sender]);
}
};
