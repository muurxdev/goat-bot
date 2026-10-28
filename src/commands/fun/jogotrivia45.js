/**
 * Comando .quizsimpsons — QUIZ OS SIMPSONS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia45`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizsimpsons",
    aliases: ["simpsonsquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz dos Simpsons: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta dos Simpsons; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual a cidade dos Simpsons?",a:"SPRINGFIELD",opts:["Shelbyville","Springfield","Quahog","Langley Falls"]},
      {q:"Onde Homer trabalha?",a:"USINA NUCLEAR",opts:["Padaria","Usina nuclear","Escola","Bar"]},
      {q:"Qual o nome do bar do Moe?",a:"TABERNA DO MOE",opts:["Taberna do Moe","Kwik-E-Mart","Krusty Burger","Bar do Barney"]},
      {q:"Quantos filhos tem o casal Simpson?",a:"3",opts:["2","3","4","5"]},
      {q:"Qual a comida favorita do Homer?",a:"ROSQUINHA",opts:["Pizza","Rosquinha","Hambúrguer","Torta"]},
      {q:"Qual o nome do palhaço da TV?",a:"KRUSTY",opts:["Bozo","Krusty","Sideshow Bob","Gabbo"]}
        ]
        return startQuiz(from, sender, reply, bank, '🍩 Quiz dos Simpsons')
    }
};
