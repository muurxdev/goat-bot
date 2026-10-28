/**
 * Comando .superpoder
 * Sorteia um superpoder com um efeito colateral bizarro
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "superpoder",
    aliases: ["meupoder", "sortearpoder", "poderbizarro"],
    category: "fun",
    description: "Sorteia um superpoder com um efeito colateral bizarro",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    const poderes = [
        { p: "Invisibilidade", c: "Mas você só fica invisível quando ninguém está olhando." },
        { p: "Super Velocidade", c: "Mas seus sapatos pegam fogo a cada 10 metros." },
        { p: "Teletransporte", c: "Mas suas roupas ficam para trás onde você estava." }
    ];
    const s = poderes[Math.floor(Math.random() * poderes.length)];
    return reply("🦸 *SEU SUPERPODER:*\n\n⚡ *Poder:* " + s.p + "\n⚠️ *Efeito Colateral:* " + s.c);
}
};
