/**
 * Comando .difftext
 * Compara dois textos rápidos exibindo semelhanças
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "difftext",
    aliases: ["textdiff","diferencastexto","cmd_difftext","alt_difftext","atalho_difftext","abrev_difftext","call_difftext","func_difftext"],
    category: "dev",
    description: "Compara dois textos rápidos exibindo semelhanças",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("🔍 *COMPARADOR DE TEXTOS:*\n\nEnvie os textos que deseja comparar e o analisador destacará adições e remoções!");
}
};
