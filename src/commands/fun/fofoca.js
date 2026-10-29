/**
 * Comando .fofoca
 * Gera uma fofoca cômica e fictícia sobre o grupo
 */
const F = require("../../utils/formato");

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "fofoca",
    aliases: ["fofocadogrupo", "noticiafalsa", "babado"],
    category: "fun",
    description: "Gera uma fofoca cômica e fictícia sobre o grupo",
    examples: [" — inventa uma fofoca cômica sobre Reino"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
    const fofocas = [
        "Flagraram o ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ comendo as sobras do Guardião de madrugada!",
        "Dizem que o Ban perdeu todo o dinheiro dele no bingo de Torre!",
        "Fontes anônimas afirmam que os admins vão sortear um pastel de vento no fim de semana."
    ];
    const f = fofocas[Math.floor(Math.random() * fofocas.length)];
    return reply(F.tela({
        emoji: "📰",
        titulo: "Extra! Fofoca do dia",
        intro: "👀 " + f,
        dica: "Tudo inventado, claro. Nenhum morador do Reino foi ferido.",
        proximos: [
            { nome: "fofoca", oque: "outra fofoca" },
            { nome: "piada", oque: "uma piada para aliviar" }
        ],
        prefix
    }));
}
};
