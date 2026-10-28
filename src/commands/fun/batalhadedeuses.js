/**
 * Comando .batalhadedeuses
 * Simulação de batalha entre deidades mitológicas
 */
const F = require("../../utils/formato");

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "batalhadedeuses",
    aliases: ["duelosagrado", "mitologiabatalha", "deusesguerra"],
    category: "fun",
    description: "Simulação de batalha entre deidades mitológicas",
    examples: [" — sorteia uma batalha entre deuses mitológicos"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
    const deuses = ["Zeus (Deus do Trovão)", "Thor (Senhor de Asgard)", "Odin (Pai de Todos)", "Anúbis (Guardião do Submundo)"];
    const d1 = deuses[Math.floor(Math.random() * deuses.length)];
    const rivais = deuses.filter(d => d !== d1);
    const d2 = rivais[Math.floor(Math.random() * rivais.length)];
    return reply(F.tela({
        emoji: "⚡",
        titulo: "Confronto divino",
        intro: "🌩️ *" + d1 + "* prevaleceu na batalha cósmica com seu poder ancestral!",
        secoes: [{ emoji: "⚔️", titulo: "A batalha", linhas: [
            F.campo("Vencedor", d1),
            F.campo("Derrotado", d2),
            F.campo("Deuses na disputa", deuses.length)
        ] }],
        dica: "Cada batalha é sorteada de novo: chame outra vez para uma revanche.",
        proximos: [
            { nome: "batalhadedeuses", oque: "nova batalha" },
            { nome: "escolhasuprema", oque: "um dilema difícil do Reino" }
        ],
        prefix
    }));
}
};
