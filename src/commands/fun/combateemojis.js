/**
 * Comando .combateemojis
 * Duelo épico entre emojis elementais no chat
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "combateemojis",
    aliases: ["emojibattle", "duelodeemojis", "lutaemojis"],
    category: "fun",
    description: "Duelo épico entre emojis elementais no chat",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("⚔️ *COMBATE DE EMOJIS!*\n\n🐉 *Dragão Vermelho* (ATK 95)\n      VS\n🤖 *Robô Cyberpunk* (ATK 90)\n\n🏆 *VENCEDOR:* 🐉 Dragão Vermelho venceu o embate!");
}
};
