/**
 * Comando .quizstarwars — QUIZ STAR WARS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia38`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizstarwars",
    aliases: ["swquiz","starwarsquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "QUIZ STAR WARS — responda no chat e ganhe XP e Coins",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quem é o pai de Luke Skywalker?",a:"DARTH VADER",opts:["Obi-Wan","Darth Vader","Yoda","Palpatine"]},
      {q:"Qual a espécie do Chewbacca?",a:"WOOKIEE",opts:["Ewok","Wookiee","Jawa","Hutt"]},
      {q:"Qual a nave de Han Solo?",a:"MILLENNIUM FALCON",opts:["X-Wing","Millennium Falcon","Estrela da Morte","Slave I"]},
      {q:"Qual mestre Jedi é pequeno e verde?",a:"YODA",opts:["Mace Windu","Yoda","Qui-Gon","Obi-Wan"]},
      {q:"Qual a cor do sabre de luz do Vader?",a:"VERMELHO",opts:["Azul","Vermelho","Verde","Roxo"]},
      {q:"Quem é a princesa da trilogia original?",a:"LEIA",opts:["Padmé","Leia","Rey","Jyn"]}
        ]
        return startQuiz(from, sender, reply, bank, '🌌 QUIZ STAR WARS')
    }
};
