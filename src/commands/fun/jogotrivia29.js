/**
 * Comando .quizpolitica — QUIZ POLÍTICA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia29`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizpolitica",
    aliases: ["politicaquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de política: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de política; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quantos poderes tem a República brasileira?",a:"3",opts:["2","3","4","5"]},
      {q:"Quanto dura o mandato de presidente no Brasil?",a:"4 ANOS",opts:["3 anos","4 anos","5 anos","6 anos"]},
      {q:"Quem promulga as leis no Brasil?",a:"PRESIDENTE",opts:["Congresso","Presidente","STF","Senado"]},
      {q:"Quantos senadores cada estado elege?",a:"3",opts:["2","3","4","5"]},
      {q:"Qual a idade mínima para votar (facultativo)?",a:"16",opts:["14","16","18","21"]},
      {q:"Qual o órgão máximo do Judiciário brasileiro?",a:"STF",opts:["STJ","STF","TSE","TRF"]}
        ]
        return startQuiz(from, sender, reply, bank, '🏛️ Quiz de política')
    }
};
