/**
 * Comando .quizmusica — QUIZ MÚSICA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia2`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizmusica",
    aliases: ["musicaquiz","quizsom"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de música: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de música; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual banda lançou 'Bohemian Rhapsody'?",a:"QUEEN",opts:["Beatles","Queen","Led Zeppelin","Pink Floyd"]},
      {q:"Quem é conhecido como 'Rei do Pop'?",a:"MICHAEL JACKSON",opts:["Elvis Presley","Michael Jackson","Prince","James Brown"]},
      {q:"Qual instrumento tem 88 teclas?",a:"PIANO",opts:["Órgão","Piano","Acordeão","Cravo"]},
      {q:"Quem compôs 'Garota de Ipanema'?",a:"TOM JOBIM",opts:["Chico Buarque","Tom Jobim","Caetano Veloso","Gilberto Gil"]},
      {q:"Quantas cordas tem um violão tradicional?",a:"6",opts:["4","5","6","7"]},
      {q:"Qual banda brasileira lançou 'Tempo Perdido'?",a:"LEGIAO URBANA",opts:["Titãs","Legião Urbana","Paralamas","Capital Inicial"]}
        ]
        return startQuiz(from, sender, reply, bank, '🎵 Quiz de música')
    }
};
