/**
 * Comando .quizpokemon — QUIZ POKÉMON
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia39`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizpokemon",
    aliases: ["pokemonquiz","pokequiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de Pokémon: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de Pokémon; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual é o Pokémon mascote da franquia?",a:"PIKACHU",opts:["Charmander","Pikachu","Bulbasaur","Squirtle"]},
      {q:"Quantos Pokémon havia na primeira geração?",a:"151",opts:["100","151","251","386"]},
      {q:"Qual a evolução final de Charmander?",a:"CHARIZARD",opts:["Charmeleon","Charizard","Flareon","Magmar"]},
      {q:"Qual o tipo do Squirtle?",a:"AGUA",opts:["Fogo","Água","Planta","Elétrico"]},
      {q:"Quem é o rival do Ash na primeira temporada?",a:"GARY",opts:["Brock","Gary","Misty","Team Rocket"]},
      {q:"Qual Pokémon lendário é um pássaro de fogo?",a:"MOLTRES",opts:["Zapdos","Moltres","Articuno","Ho-Oh"]}
        ]
        return startQuiz(from, sender, reply, bank, '⚡ Quiz de Pokémon')
    }
};
