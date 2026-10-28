/**
 * Comando .stopletra — Sorteia uma letra aleatória para brincar de Stop/Adedonha: .stopletra
 */
const F = require("../../utils/formato");
module.exports = {
    name: "stopletra",
    aliases: ["stopletra-cmd","cmd-stopletra"],
    category: "fun",
    subcategory: "Jogos",
    description: "Sorteia uma letra para brincar de Stop (Adedonha)",
    examples: [" — sorteia a letra da rodada"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
            const letras = "ABCDEFGHIJKLMNOPQRSTUVZ";
            const sorteada = letras[Math.floor(Math.random() * letras.length)];
            return reply(F.tela({
                emoji: "🛑",
                titulo: `Stop: letra ${sorteada}`,
                intro: `A letra sorteada é *${sorteada}*. Valendo!`,
                secoes: [
                    { emoji: "📋", titulo: "Categorias", linhas: ["Nome · Animal · Cidade · Cor · Objeto"] },
                    { emoji: "📜", titulo: "Como jogar", linhas: [
                        "• Escreva uma palavra com a letra para cada categoria.",
                        "• Quem completar tudo primeiro manda *STOP* no chat.",
                        "• Palavra repetida entre jogadores vale menos."
                    ] }
                ],
                dica: "Combinem um tempo limite antes de começar, tipo 1 minuto.",
                proximos: [
                    { nome: "stopletra", oque: "sortear outra letra" },
                    { nome: "duelopalavras", oque: "duelo de rimas" }
                ],
                prefix
            }));
        }
};
