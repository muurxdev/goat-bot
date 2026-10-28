/**
 * Comando .quizgames — QUIZ VIDEOGAMES
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia5`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizgames",
    aliases: ["gamesquiz","quizvideogame"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de videogames: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de videogames; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o encanador mais famoso dos games?",a:"MARIO",opts:["Luigi","Mario","Wario","Sonic"]},
      {q:"Em qual jogo você constrói com blocos?",a:"MINECRAFT",opts:["Terraria","Minecraft","Roblox","Fortnite"]},
      {q:"Qual empresa criou o PlayStation?",a:"SONY",opts:["Microsoft","Sony","Nintendo","Sega"]},
      {q:"Qual é o ouriço azul da Sega?",a:"SONIC",opts:["Tails","Sonic","Knuckles","Shadow"]},
      {q:"Em 'League of Legends', quantos jogadores por time?",a:"5",opts:["3","4","5","6"]},
      {q:"Qual console lançou o Nintendo 64?",a:"NINTENDO",opts:["Sony","Sega","Nintendo","Atari"]}
        ]
        return startQuiz(from, sender, reply, bank, '🎮 Quiz de videogames')
    }
};
