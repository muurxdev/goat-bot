/**
 * Comando .quizanos90 — QUIZ ANOS 90
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia44`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizanos90",
    aliases: ["anos90quiz","quiznoventa"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "QUIZ ANOS 90 — responda no chat e ganhe XP e Coins",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual console marcou os anos 90 da Sega?",a:"MEGA DRIVE",opts:["Master System","Mega Drive","Dreamcast","Saturn"]},
      {q:"Qual grupo cantou 'Wannabe'?",a:"SPICE GIRLS",opts:["Backstreet Boys","Spice Girls","NSYNC","TLC"]},
      {q:"Qual brinquedo virtual japonês fez sucesso?",a:"TAMAGOTCHI",opts:["Game Boy","Tamagotchi","Pog","Yo-yo"]},
      {q:"Qual programa infantil tinha a Xuxa?",a:"XOU DA XUXA",opts:["Bambuluá","Xou da Xuxa","TV Colosso","Castelo Rá-Tim-Bum"]},
      {q:"Qual filme de dinossauros marcou 1993?",a:"JURASSIC PARK",opts:["Godzilla","Jurassic Park","King Kong","Anaconda"]},
      {q:"Qual mídia guardava música antes do CD dominar?",a:"FITA CASSETE",opts:["Vinil","Fita cassete","MiniDisc","MP3"]}
        ]
        return startQuiz(from, sender, reply, bank, '📼 QUIZ ANOS 90')
    }
};
