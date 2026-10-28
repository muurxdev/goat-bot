/**
 * Comando .quizanatomia — QUIZ ANATOMIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia6`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizanatomia",
    aliases: ["anatomiaquiz","quizcorpo"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de anatomia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de anatomia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quantos ossos tem o corpo humano adulto?",a:"206",opts:["186","206","226","256"]},
      {q:"Qual o maior órgão do corpo humano?",a:"PELE",opts:["Fígado","Pele","Pulmão","Intestino"]},
      {q:"Quantas câmaras tem o coração?",a:"4",opts:["2","3","4","5"]},
      {q:"Qual o maior osso do corpo?",a:"FEMUR",opts:["Tíbia","Fêmur","Úmero","Coluna"]},
      {q:"Qual órgão produz a insulina?",a:"PANCREAS",opts:["Fígado","Pâncreas","Rim","Baço"]},
      {q:"Quantos litros de sangue tem um adulto em média?",a:"5",opts:["3","5","8","10"]}
        ]
        return startQuiz(from, sender, reply, bank, '🫀 Quiz de anatomia')
    }
};
