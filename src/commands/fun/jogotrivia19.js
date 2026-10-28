/**
 * Comando .quizmarcas — QUIZ MARCAS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia19`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizmarcas",
    aliases: ["marcasquiz","quizlogos"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de marcas: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de marcas; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual marca tem a maçã mordida?",a:"APPLE",opts:["Android","Apple","Samsung","LG"]},
      {q:"Qual o slogan 'Just Do It'?",a:"NIKE",opts:["Adidas","Nike","Puma","Reebok"]},
      {q:"Qual marca tem o arco dourado (M)?",a:"MCDONALDS",opts:["Burger King","McDonald's","Subway","KFC"]},
      {q:"Qual empresa tem a sereia verde no logo?",a:"STARBUCKS",opts:["Costa","Starbucks","Dunkin","Peet's"]},
      {q:"Qual marca de refrigerante é vermelha e branca?",a:"COCA-COLA",opts:["Pepsi","Coca-Cola","Guaraná","Fanta"]},
      {q:"Qual marca usa três listras?",a:"ADIDAS",opts:["Nike","Adidas","Puma","Fila"]}
        ]
        return startQuiz(from, sender, reply, bank, '🏷️ Quiz de marcas')
    }
};
