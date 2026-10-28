/**
 * Comando .quizciencias — Pergunta de conhecimentos de Ciências e Biologia: .quizciencias
 */
module.exports = {
    name: "quizciencias",
    aliases: ["quizciencias-cmd","cmd-quizciencias"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta de conhecimentos de Ciências e Biologia: .quizciencias",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Qual é o elemento químico mais abundante no universo?", a: "Hidrogênio" },
                { q: "Quantos ossos tem o corpo humano adulto?", a: "206" },
                { q: "Qual é a velocidade aproximada da luz?", a: "300.000 km/s" },
                { q: "Qual organela celular é conhecida como a usina de energia da célula?", a: "Mitocôndria" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`🔬 *QUIZ DE CIÊNCIAS*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta oculta:* ||${q.a}||`);
        }
};
