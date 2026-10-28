/**
 * Comando .quizbrasil — QUIZ BRASIL
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia25`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizbrasil",
    aliases: ["brasilquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz do Brasil: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta do Brasil; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual a capital do Brasil?",a:"BRASILIA",opts:["Rio de Janeiro","Brasília","São Paulo","Salvador"]},
      {q:"Quantos estados tem o Brasil?",a:"26",opts:["25","26","27","28"]},
      {q:"Em que ano o Brasil foi descoberto?",a:"1500",opts:["1492","1500","1502","1530"]},
      {q:"Qual o maior estado brasileiro em área?",a:"AMAZONAS",opts:["Pará","Amazonas","Mato Grosso","Bahia"]},
      {q:"Qual o rio mais extenso do Brasil?",a:"AMAZONAS",opts:["São Francisco","Amazonas","Paraná","Tocantins"]},
      {q:"Quantas vezes o Brasil ganhou a Copa do Mundo?",a:"5",opts:["3","4","5","6"]}
        ]
        return startQuiz(from, sender, reply, bank, '🇧🇷 Quiz do Brasil')
    }
};
