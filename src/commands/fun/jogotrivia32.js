/**
 * Comando .quizfilosofia — QUIZ FILOSOFIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia32`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizfilosofia",
    aliases: ["filosofiaquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de filosofia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de filosofia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quem disse 'Penso, logo existo'?",a:"DESCARTES",opts:["Platão","Descartes","Kant","Sócrates"]},
      {q:"Quem foi o mestre de Platão?",a:"SOCRATES",opts:["Aristóteles","Sócrates","Pitágoras","Heráclito"]},
      {q:"Quem escreveu 'A República'?",a:"PLATAO",opts:["Aristóteles","Platão","Cícero","Sêneca"]},
      {q:"Quem disse 'Só sei que nada sei'?",a:"SOCRATES",opts:["Platão","Sócrates","Diógenes","Epicuro"]},
      {q:"Qual filósofo criou o 'imperativo categórico'?",a:"KANT",opts:["Hegel","Kant","Nietzsche","Hume"]},
      {q:"Quem escreveu 'Assim Falou Zaratustra'?",a:"NIETZSCHE",opts:["Schopenhauer","Nietzsche","Marx","Freud"]}
        ]
        return startQuiz(from, sender, reply, bank, '🤔 Quiz de filosofia')
    }
};
