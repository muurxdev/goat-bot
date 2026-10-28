/**
 * Comando .piadaaleatoria
 * Conta uma piada ou trocadilho divertido no grupo
 */
const F = require("../../utils/formato");

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "piadaaleatoria",
    aliases: ["contarpiada", "piadinha", "trocadilho"],
    category: "fun",
    description: "Conta uma piada ou trocadilho divertido no grupo",
    examples: [" — conta uma piada ou trocadilho"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
    const piadas = [
        "Por que o desenvolvedor usa óculos escuros? Porque ele programa em C#!",
        "O que o zero disse para o oito? Belo cinto!",
        "Como o Batman faz para que os outros entrem no carro dele? — Bat-bate a porta!"
    ];
    const p = piadas[Math.floor(Math.random() * piadas.length)];
    return reply(F.tela({
        emoji: "😂",
        titulo: "Piada",
        intro: p,
        dica: "Se ninguém riu, a culpa é da plateia.",
        proximos: [
            { nome: "piadaaleatoria", oque: "outra piada" },
            { nome: "piadaseca", oque: "uma piada seca" }
        ],
        prefix
    }));
}
};
