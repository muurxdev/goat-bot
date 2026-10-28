/**
 * Comando .quizbiblico — Pergunta sobre passagens e figuras bíblicas: .quizbiblico
 */
const F = require("../../utils/formato");
module.exports = {
    name: "quizbiblico",
    aliases: ["quizbiblico-cmd","cmd-quizbiblico"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre passagens e figuras bíblicas, com a resposta escondida",
    examples: [" — sorteia uma pergunta bíblica"],
    cooldownMs: 2500,
    execute: async ({ reply, prefix = "." }) => {
            const quizes = [
                { q: "Quem construiu a arca para escapar do grande dilúvio?", a: "Noé" },
                { q: "Qual jovem pastor derrotou o gigante Golias com uma funda?", a: "Davi" },
                { q: "Quantos apóstolos principais Jesus escolheu?", a: "12" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(F.tela({
                emoji: "📖",
                titulo: "Quiz bíblico",
                intro: `❓ *${q.q}*`,
                secoes: [{ emoji: "🔒", titulo: "Resposta", linhas: [`Pense antes de olhar: ||${q.a}||`] }],
                dica: "Desafie o grupo a responder antes de alguém revelar.",
                proximos: [
                    { nome: "quizbiblico", oque: "outra pergunta" },
                    { nome: "quizreligiao", oque: "quiz de religiões que vale prêmio" }
                ],
                prefix
            }));
        }
};
