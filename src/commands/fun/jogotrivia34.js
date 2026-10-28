/**
 * Comando .quizdesenhos — QUIZ DESENHOS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia34`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizdesenhos",
    aliases: ["desenhosquiz","quizcartoon"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de desenhos: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de desenhos; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quem mora em um abacaxi no fundo do mar?",a:"BOB ESPONJA",opts:["Patrick","Bob Esponja","Lula Molusco","Sr. Siriguejo"]},
      {q:"Qual desenho tem Tom e Jerry?",a:"TOM E JERRY",opts:["Pica-Pau","Tom e Jerry","Looney Tunes","Popeye"]},
      {q:"Quantos são os Cavaleiros do Zodíaco de bronze principais?",a:"5",opts:["4","5","6","7"]},
      {q:"Qual cor é o Pica-Pau?",a:"VERMELHO",opts:["Azul","Vermelho","Verde","Amarelo"]},
      {q:"Quem é o eterno rival do Coiote?",a:"PAPA-LEGUAS",opts:["Pernalonga","Papa-Léguas","Patolino","Gaguinho"]},
      {q:"Em 'Scooby-Doo', qual o nome do dono do cachorro?",a:"SALSICHA",opts:["Fred","Salsicha","Velma","Daphne"]}
        ]
        return startQuiz(from, sender, reply, bank, '📺 Quiz de desenhos')
    }
};
