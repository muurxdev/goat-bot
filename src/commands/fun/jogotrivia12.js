/**
 * Comando .quizculinaria — QUIZ CULINÁRIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia12`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizculinaria",
    aliases: ["culinariaquiz","quizcomida"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de culinária: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de culinária; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual ingrediente principal do guacamole?",a:"ABACATE",opts:["Tomate","Abacate","Pepino","Manga"]},
      {q:"De que país é originário o sushi?",a:"JAPAO",opts:["China","Japão","Coreia","Tailândia"]},
      {q:"Qual o prato típico da Bahia feito com dendê?",a:"ACARAJE",opts:["Vatapá","Acarajé","Moqueca","Caruru"]},
      {q:"Qual é a base da massa de pão?",a:"FARINHA",opts:["Açúcar","Farinha","Ovo","Leite"]},
      {q:"Que temperatura a água ferve ao nível do mar?",a:"100",opts:["90 °C","100 °C","110 °C","120 °C"]},
      {q:"Qual queijo é usado tradicionalmente na pizza margherita?",a:"MUSSARELA",opts:["Parmesão","Mussarela","Gorgonzola","Provolone"]}
        ]
        return startQuiz(from, sender, reply, bank, '🍳 Quiz de culinária')
    }
};
