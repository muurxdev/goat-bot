/**
 * Comando .quizdragonball — QUIZ DRAGON BALL
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia40`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizdragonball",
    aliases: ["dbquiz","dragonballquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de Dragon Ball: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de Dragon Ball; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o nome saiyajin do Goku?",a:"KAKAROTO",opts:["Vegeta","Kakaroto","Raditz","Nappa"]},
      {q:"Quantas esferas do dragão existem?",a:"7",opts:["5","6","7","8"]},
      {q:"Qual o nome do dragão das esferas?",a:"SHENLONG",opts:["Porunga","Shenlong","Ultimate Shenron","Icarus"]},
      {q:"Quem é o príncipe dos saiyajins?",a:"VEGETA",opts:["Goku","Vegeta","Nappa","Broly"]},
      {q:"Qual golpe é a marca registrada do Goku?",a:"KAMEHAMEHA",opts:["Big Bang","Kamehameha","Final Flash","Makankosappo"]},
      {q:"Qual vilão destruiu o planeta Vegeta?",a:"FREEZA",opts:["Cell","Freeza","Majin Buu","Broly"]}
        ]
        return startQuiz(from, sender, reply, bank, '🐉 Quiz de Dragon Ball')
    }
};
