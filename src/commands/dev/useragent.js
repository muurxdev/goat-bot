/**
 * Comando .useragent
 * Gera strings realistas de User-Agent de navegadores modernos
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "useragent",
    aliases: ["geraruseragent","uaheader","browserua","cmd_useragent","alt_useragent","atalho_useragent","abrev_useragent","call_useragent","func_useragent"],
    category: "dev",
    description: "Gera strings realistas de User-Agent de navegadores modernos",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("🌐 *USER-AGENT DE NAVEGADOR GERADO:*\n\n`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36`");
}
};
