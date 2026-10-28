/**
 * Comando .quizanimais — QUIZ ANIMAIS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia13`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizanimais",
    aliases: ["animaisquiz","quizbichos"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de animais: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de animais; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o animal terrestre mais rápido?",a:"GUEPARDO",opts:["Leão","Guepardo","Cavalo","Antílope"]},
      {q:"Quantos corações tem um polvo?",a:"3",opts:["1","2","3","4"]},
      {q:"Qual mamífero pode voar?",a:"MORCEGO",opts:["Esquilo","Morcego","Colugo","Nenhum"]},
      {q:"Qual o maior felino do mundo?",a:"TIGRE",opts:["Leão","Tigre","Onça","Leopardo"]},
      {q:"Qual ave não consegue voar?",a:"PINGUIM",opts:["Águia","Pinguim","Falcão","Gaivota"]},
      {q:"Quanto tempo dorme um coala por dia (aprox.)?",a:"20 HORAS",opts:["10 horas","14 horas","20 horas","24 horas"]}
        ]
        return startQuiz(from, sender, reply, bank, '🦁 Quiz de animais')
    }
};
