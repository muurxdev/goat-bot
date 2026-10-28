/**
 * Comando .quizsuperherois — QUIZ SUPER-HERÓIS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia35`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizsuperherois",
    aliases: ["heroisquiz","quizherois"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de super-heróis: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de super-heróis; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o nome verdadeiro do Homem de Ferro?",a:"TONY STARK",opts:["Bruce Wayne","Tony Stark","Steve Rogers","Peter Parker"]},
      {q:"Qual a cidade do Batman?",a:"GOTHAM",opts:["Metrópolis","Gotham","Central City","Star City"]},
      {q:"Qual o planeta natal do Superman?",a:"KRYPTON",opts:["Marte","Krypton","Asgard","Tamaran"]},
      {q:"Quem é o alter ego do Homem-Aranha?",a:"PETER PARKER",opts:["Miles Morales","Peter Parker","Harry Osborn","Eddie Brock"]},
      {q:"Qual metal compõe as garras do Wolverine?",a:"ADAMANTIUM",opts:["Vibranium","Adamantium","Titânio","Uru"]},
      {q:"Qual o martelo do Thor?",a:"MJOLNIR",opts:["Stormbreaker","Mjolnir","Gungnir","Excalibur"]}
        ]
        return startQuiz(from, sender, reply, bank, '🦸 Quiz de super-heróis')
    }
};
