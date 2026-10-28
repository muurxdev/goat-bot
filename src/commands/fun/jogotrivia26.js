/**
 * Comando .quizfolclore — QUIZ FOLCLORE
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia26`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizfolclore",
    aliases: ["folcloreQuiz","quizlendas"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de folclore: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de folclore; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual personagem tem os pés virados para trás?",a:"CURUPIRA",opts:["Saci","Curupira","Boitatá","Caipora"]},
      {q:"Qual personagem tem uma perna só?",a:"SACI",opts:["Curupira","Saci","Boto","Mula sem cabeça"]},
      {q:"Qual criatura é uma cobra de fogo?",a:"BOITATA",opts:["Iara","Boitatá","Cuca","Lobisomem"]},
      {q:"Qual sereia dos rios encanta homens?",a:"IARA",opts:["Cuca","Iara","Mãe d'Água","Boiúna"]},
      {q:"Qual personagem vira boi à noite?",a:"BOITATA",opts:["Boto","Boitatá","Mula sem cabeça","Bumba meu boi"]},
      {q:"Qual bruxa do folclore tem cara de jacaré?",a:"CUCA",opts:["Iara","Cuca","Caipora","Matinta"]}
        ]
        return startQuiz(from, sender, reply, bank, '🪘 Quiz de folclore')
    }
};
