/**
 * Comando .quiznaruto — QUIZ NARUTO
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia41`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quiznaruto",
    aliases: ["narutoquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de Naruto: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de Naruto; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual vila é a de Naruto?",a:"KONOHA",opts:["Suna","Konoha","Kiri","Iwa"]},
      {q:"Qual a besta selada dentro do Naruto?",a:"KURAMA",opts:["Shukaku","Kurama","Matatabi","Gyuki"]},
      {q:"Quem é o rival de Naruto?",a:"SASUKE",opts:["Kiba","Sasuke","Neji","Gaara"]},
      {q:"Qual o nome do sensei do time 7?",a:"KAKASHI",opts:["Guy","Kakashi","Asuma","Iruka"]},
      {q:"Qual técnica Naruto usa mais?",a:"RASENGAN",opts:["Chidori","Rasengan","Amaterasu","Susanoo"]},
      {q:"Qual clã tem o Sharingan?",a:"UCHIHA",opts:["Hyuga","Uchiha","Nara","Senju"]}
        ]
        return startQuiz(from, sender, reply, bank, '🍥 Quiz de Naruto')
    }
};
