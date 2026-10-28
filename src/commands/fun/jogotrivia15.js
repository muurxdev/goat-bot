/**
 * Comando .quizbandeiras — QUIZ BANDEIRAS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia15`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizbandeiras",
    aliases: ["bandeirasquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de bandeiras: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de bandeiras; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual bandeira tem uma folha de bordo?",a:"CANADA",opts:["EUA","Canadá","Suíça","Áustria"]},
      {q:"Qual bandeira tem um círculo vermelho no centro branco?",a:"JAPAO",opts:["China","Japão","Coreia","Bangladesh"]},
      {q:"Quantas estrelas tem a bandeira dos EUA?",a:"50",opts:["48","50","52","13"]},
      {q:"Qual a frase na bandeira do Brasil?",a:"ORDEM E PROGRESSO",opts:["Ordem e Progresso","Pátria Amada","Independência","União e Glória"]},
      {q:"Qual bandeira é uma cruz branca em fundo vermelho?",a:"SUICA",opts:["Dinamarca","Suíça","Noruega","Inglaterra"]},
      {q:"Quantas cores tem a bandeira da França?",a:"3",opts:["2","3","4","5"]}
        ]
        return startQuiz(from, sender, reply, bank, '🏳️ Quiz de bandeiras')
    }
};
