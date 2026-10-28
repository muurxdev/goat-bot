/**
 * Comando .quizmitologia — QUIZ MITOLOGIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia10`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizmitologia",
    aliases: ["mitologiaquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de mitologia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de mitologia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quem é o deus do trovão na mitologia nórdica?",a:"THOR",opts:["Odin","Thor","Loki","Baldur"]},
      {q:"Quem é o rei dos deuses gregos?",a:"ZEUS",opts:["Poseidon","Zeus","Hades","Apolo"]},
      {q:"Qual criatura grega tinha cabeça de touro?",a:"MINOTAURO",opts:["Centauro","Minotauro","Sátiro","Ciclope"]},
      {q:"Quem é o deus grego do mar?",a:"POSEIDON",opts:["Zeus","Poseidon","Hades","Hermes"]},
      {q:"Na mitologia nórdica, qual é o fim do mundo?",a:"RAGNAROK",opts:["Valhalla","Ragnarok","Asgard","Bifrost"]},
      {q:"Quem carregava o mundo nas costas?",a:"ATLAS",opts:["Prometeu","Atlas","Hércules","Cronos"]}
        ]
        return startQuiz(from, sender, reply, bank, '⚡ Quiz de mitologia')
    }
};
