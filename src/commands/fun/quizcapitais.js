/**
 * Comando .quizcapitais — Pergunta qual é a capital de um país do mundo
 */
const F = require("../../utils/formato");
module.exports = {
    name: "quizcapitais",
    aliases: ["pergutacapital"],
    category: "fun",
    subcategory: "Jogos",
    description: "Pergunta qual é a capital de um país do mundo",
    examples: [" — pergunta a capital de um país"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const list = [
                { country: 'Japão', capital: 'Tóquio' },
                { country: 'França', capital: 'Paris' },
                { country: 'Canadá', capital: 'Ottawa' },
                { country: 'Austrália', capital: 'Camberra' },
                { country: 'Alemanha', capital: 'Berlim' },
                { country: 'Egito', capital: 'Cairo' },
                { country: 'Argentina', capital: 'Buenos Aires' },
                { country: 'Itália', capital: 'Roma' },
                { country: 'Espanha', capital: 'Madrid' },
                { country: 'Rússia', capital: 'Moscou' }
            ];
            const sel = list[Math.floor(Math.random() * list.length)];
            return reply(F.tela({
                emoji: "🌍",
                titulo: "Quiz de capitais",
                intro: `❓ Qual é a capital de *${sel.country}*?`,
                secoes: [{ emoji: "🔒", titulo: "Resposta", linhas: [`Pense antes de olhar: ||${sel.capital}||`] }],
                dica: "Quem responder no chat antes de revelar ganha o respeito do grupo.",
                proximos: [
                    { nome: "quizcapitais", oque: "outro país" },
                    { nome: "quizpaises", oque: "quiz de países que vale prêmio" }
                ],
                prefix
            }));
        }
};
