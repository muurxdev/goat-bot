/**
 * Comando .desafioimpossivel
 * Desafio diário da comunidade para cumprir no grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "desafioimpossivel",
    aliases: ["missaoimpossivel", "desafiodiario", "challengedia"],
    category: "fun",
    description: "Desafio diário da comunidade para cumprir no grupo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("🔥 *DESAFIO DO DIA:*\n\n📌 Envie um áudio cantando a primeira estrofe da abertura de Saga Épica sem rir!");
}
};
