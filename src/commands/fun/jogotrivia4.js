/**
 * Comando .quizingles — QUIZ INGLÊS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia4`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizingles",
    aliases: ["englishquiz","quizenglish"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "QUIZ INGLÊS — responda no chat e ganhe XP e Coins",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Como se diz 'obrigado' em inglês?",a:"THANK YOU",opts:["Please","Thank you","Sorry","Welcome"]},
      {q:"Qual o passado de 'go'?",a:"WENT",opts:["Goed","Gone","Went","Going"]},
      {q:"'Book' significa o quê?",a:"LIVRO",opts:["Caderno","Livro","Mesa","Cadeira"]},
      {q:"Como se diz 'segunda-feira'?",a:"MONDAY",opts:["Sunday","Monday","Tuesday","Saturday"]},
      {q:"Qual o plural de 'child'?",a:"CHILDREN",opts:["Childs","Childes","Children","Childrens"]},
      {q:"'Blue' é qual cor?",a:"AZUL",opts:["Verde","Azul","Vermelho","Amarelo"]}
        ]
        return startQuiz(from, sender, reply, bank, '🇺🇸 QUIZ INGLÊS')
    }
};
