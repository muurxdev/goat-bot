/**
 * Comando .quizcuriosidades — QUIZ CURIOSIDADES
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia24`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizcuriosidades",
    aliases: ["curiosidadesquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de curiosidades: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de curiosidades; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual animal nunca dorme completamente?",a:"GOLFINHO",opts:["Girafa","Golfinho","Tubarão","Coruja"]},
      {q:"Quanto tempo o mel dura sem estragar?",a:"INDEFINIDAMENTE",opts:["1 ano","10 anos","100 anos","Indefinidamente"]},
      {q:"Qual é o único metal líquido à temperatura ambiente?",a:"MERCURIO",opts:["Chumbo","Mercúrio","Gálio","Sódio"]},
      {q:"Bananas são tecnicamente o quê?",a:"BAGA",opts:["Fruta","Baga","Legume","Raiz"]},
      {q:"Quantos ossos tem um bebê ao nascer (aprox.)?",a:"300",opts:["206","250","300","350"]},
      {q:"Qual o alimento mais consumido do mundo?",a:"ARROZ",opts:["Trigo","Arroz","Milho","Batata"]}
        ]
        return startQuiz(from, sender, reply, bank, '💡 Quiz de curiosidades')
    }
};
