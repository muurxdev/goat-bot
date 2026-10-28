/**
 * Comando .quizesportes — Pergunta sobre esportes olímpicos e recordes: .quizesportes
 */
module.exports = {
    name: "quizesportes",
    aliases: ["quizesportes-cmd","cmd-quizesportes"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre esportes olímpicos e recordes: .quizesportes",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Quantas medalhas de ouro olímpicas Michael Phelps possui?", a: "23" },
                { q: "Qual esporte utiliza os termos Strike, Spare e Split?", a: "Boliche" },
                { q: "Qual país sediou os primeiros Jogos Olímpicos da Era Moderna em 1896?", a: "Grécia (Atenas)" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`🏅 *QUIZ DE ESPORTES*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta oculta:* ||${q.a}||`);
        }
};
