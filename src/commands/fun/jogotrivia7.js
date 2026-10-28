/**
 * Comando .quizfisica — QUIZ FÍSICA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia7`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizfisica",
    aliases: ["fisicaquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de física: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de física; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual a velocidade da luz no vácuo (aprox.)?",a:"300000 KM/S",opts:["150.000 km/s","300.000 km/s","500.000 km/s","1.000.000 km/s"]},
      {q:"Quem formulou a Teoria da Relatividade?",a:"EINSTEIN",opts:["Newton","Einstein","Tesla","Bohr"]},
      {q:"Qual a unidade de força no SI?",a:"NEWTON",opts:["Joule","Newton","Watt","Pascal"]},
      {q:"O que mede um amperímetro?",a:"CORRENTE",opts:["Tensão","Corrente","Resistência","Potência"]},
      {q:"Qual a aceleração da gravidade na Terra (aprox.)?",a:"9.8",opts:["8,9 m/s²","9,8 m/s²","10,8 m/s²","11,2 m/s²"]},
      {q:"Quem descobriu a lei da gravitação universal?",a:"NEWTON",opts:["Galileu","Newton","Kepler","Copérnico"]}
        ]
        return startQuiz(from, sender, reply, bank, '⚛️ Quiz de física')
    }
};
