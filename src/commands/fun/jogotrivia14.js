/**
 * Comando .quizpaises — QUIZ PAÍSES
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia14`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizpaises",
    aliases: ["paisesquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de países: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de países; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual país tem o formato de bota?",a:"ITALIA",opts:["Grécia","Itália","Espanha","Portugal"]},
      {q:"Em qual país fica Machu Picchu?",a:"PERU",opts:["Bolívia","Peru","Chile","Equador"]},
      {q:"Qual o país mais populoso da África?",a:"NIGERIA",opts:["Egito","Nigéria","Etiópia","Congo"]},
      {q:"Qual país tem mais fusos horários?",a:"FRANCA",opts:["Rússia","França","EUA","China"]},
      {q:"Qual país foi o primeiro a chegar à Lua?",a:"EUA",opts:["URSS","EUA","China","Japão"]},
      {q:"Qual país produz mais café?",a:"BRASIL",opts:["Colômbia","Brasil","Vietnã","Etiópia"]}
        ]
        return startQuiz(from, sender, reply, bank, '🌍 Quiz de países')
    }
};
