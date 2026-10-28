/**
 * Comando .detectormentira
 * Detector de mentiras divertido para analisar afirmações
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "detectormentira",
    aliases: ["poligrafo", "detectorverdade", "mentiroso"],
    category: "fun",
    description: "Detector de mentiras divertido para analisar afirmações",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const resultado = Math.random() > 0.5 ? "🟢 *VERDADE ABSOLUTA (100% Sincero)*" : "🔴 *MENTIRA DETECTADA (0% Confiança)*";
    return reply("📟 *POLÍGRAFO / DETECTOR DE MENTIRAS:*\n\n👤 *Análise de:* @" + sender.split("@")[0] + "\n📊 *Veredito:* " + resultado, [sender]);
}
};
