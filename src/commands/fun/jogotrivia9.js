/**
 * Comando .quizastronomia — QUIZ ASTRONOMIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia9`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizastronomia",
    aliases: ["astronomiaquiz","quizespaco"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de astronomia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de astronomia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o maior planeta do Sistema Solar?",a:"JUPITER",opts:["Saturno","Júpiter","Netuno","Urano"]},
      {q:"Qual planeta é conhecido como Planeta Vermelho?",a:"MARTE",opts:["Vênus","Marte","Mercúrio","Júpiter"]},
      {q:"Quantos planetas tem o Sistema Solar?",a:"8",opts:["7","8","9","10"]},
      {q:"Qual a estrela mais próxima da Terra?",a:"SOL",opts:["Alpha Centauri","Sol","Sirius","Proxima"]},
      {q:"Quem foi o primeiro humano no espaço?",a:"GAGARIN",opts:["Armstrong","Gagarin","Aldrin","Glenn"]},
      {q:"Qual é o satélite natural da Terra?",a:"LUA",opts:["Fobos","Lua","Europa","Titã"]}
        ]
        return startQuiz(from, sender, reply, bank, '🔭 Quiz de astronomia')
    }
};
