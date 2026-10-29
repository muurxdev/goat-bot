/**
 * Comando .escolhasuprema — Decida um dilema difícil do Reino: .escolhasuprema
 */
const F = require("../../utils/formato");
module.exports = {
    name: "escolhasuprema",
    aliases: ["escolhasuprema-cmd","cmd-escolhasuprema"],
    category: "fun",
    subcategory: "Jogos",
    description: "Sorteia um dilema difícil do Reino para o grupo decidir",
    examples: [" — sorteia um \"você prefere\" do Reino"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const dilemas = [
                "Você prefere: Ter o poder absoluto de Herói só ao meio-dia OU a imortalidade de Ban?",
                "Você prefere: Comer a comida do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ todo dia OU lutar desarmado contra Cavaleiro?",
                "Você prefere: Voar com as asas de King OU ler pensamentos como Mago?"
            ];
            const partes = dilemas[Math.floor(Math.random() * dilemas.length)].replace(/^Você prefere:\s*/, "").replace(/\?$/, "").split(" OU ")
                .map(p => p.charAt(0).toUpperCase() + p.slice(1));
            return reply(F.tela({
                emoji: "⚖️",
                titulo: "Dilema supremo",
                intro: "Você prefere...",
                secoes: [{ emoji: "🤔", titulo: "Escolha um lado", linhas: [
                    "🅰️ " + partes[0],
                    "🅱️ " + (partes[1] || "")
                ] }],
                dica: "Responda A ou B no chat e defenda sua escolha.",
                proximos: [
                    { nome: "escolhasuprema", oque: "outro dilema" },
                    { nome: "verdadeoudesafio", oque: "verdade ou desafio" }
                ],
                prefix
            }));
        }
};
