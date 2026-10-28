/**
 * Comando .quizquimica — Pergunta sobre a tabela periódica dos elementos: .quizquimica
 */
const F = require("../../utils/formato");
module.exports = {
    name: "quizquimica",
    aliases: ["quizquimica-cmd","cmd-quizquimica"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre a tabela periódica, com a resposta escondida",
    examples: [" — sorteia uma pergunta de química"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const quizes = [
                { q: "Qual é o símbolo químico do Ouro?", a: "Au" },
                { q: "Qual é o metal que se encontra em estado líquido em temperatura ambiente?", a: "Mercúrio (Hg)" },
                { q: "Qual elemento possui o número atômico 1?", a: "Hidrogênio (H)" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(F.tela({
                emoji: "🧪",
                titulo: "Quiz de química",
                intro: `❓ *${q.q}*`,
                secoes: [{ emoji: "🔒", titulo: "Resposta", linhas: [`Pense antes de olhar: ||${q.a}||`] }],
                dica: "Desafie o grupo a responder antes de alguém revelar.",
                proximos: [
                    { nome: "quizquimica", oque: "outra pergunta" },
                    { nome: "quizfisica", oque: "quiz de física que vale prêmio" }
                ],
                prefix
            }));
        }
};
