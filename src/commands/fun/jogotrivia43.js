/**
 * Comando .quizseries — QUIZ SÉRIES
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia43`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizseries",
    aliases: ["seriesquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de séries: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de séries; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Em qual série aparece Walter White?",a:"BREAKING BAD",opts:["Better Call Saul","Breaking Bad","Ozark","Narcos"]},
      {q:"Qual série passa em Hawkins?",a:"STRANGER THINGS",opts:["Dark","Stranger Things","The OA","Riverdale"]},
      {q:"Quantas temporadas tem 'Game of Thrones'?",a:"8",opts:["6","7","8","9"]},
      {q:"Em 'Friends', quem é o paleontólogo?",a:"ROSS",opts:["Chandler","Ross","Joey","Monica"]},
      {q:"Qual série tem o Cavaleiro Sem Cabeça em Hawkins? (pegadinha)",a:"STRANGER THINGS",opts:["Sleepy Hollow","Stranger Things","Dark","Supernatural"]},
      {q:"Qual série coreana ficou famosa com jogos mortais?",a:"ROUND 6",opts:["Alice in Borderland","Round 6","Sweet Home","Kingdom"]}
        ]
        return startQuiz(from, sender, reply, bank, '📺 Quiz de séries')
    }
};
