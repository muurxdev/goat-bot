/**
 * Comando .quizfilmes — QUIZ CINEMA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia1`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizfilmes",
    aliases: ["quizcinema","filmesquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de cinema: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de cinema; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quem dirigiu 'Titanic' (1997)?",a:"JAMES CAMERON",opts:["Steven Spielberg","James Cameron","Ridley Scott","Martin Scorsese"]},
      {q:"Qual filme ganhou o Oscar de Melhor Filme em 2020?",a:"PARASITA",opts:["1917","Coringa","Parasita","Era uma Vez em Hollywood"]},
      {q:"Quem interpretou Jack Sparrow?",a:"JOHNNY DEPP",opts:["Orlando Bloom","Johnny Depp","Brad Pitt","Tom Cruise"]},
      {q:"Em 'Matrix', qual pílula Neo escolhe?",a:"VERMELHA",opts:["Azul","Vermelha","Verde","Amarela"]},
      {q:"Qual é o filme de maior bilheteria da história?",a:"AVATAR",opts:["Vingadores Ultimato","Avatar","Titanic","Star Wars"]},
      {q:"Quem dirigiu 'Cidade de Deus'?",a:"FERNANDO MEIRELLES",opts:["Walter Salles","Fernando Meirelles","José Padilha","Kleber Mendonça"]}
        ]
        return startQuiz(from, sender, reply, bank, '🎬 Quiz de cinema')
    }
};
