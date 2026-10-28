/**
 * Comando .quizmedicina — QUIZ MEDICINA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia30`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizmedicina",
    aliases: ["medicinaquiz","quizsaude"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de medicina: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de medicina; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual vitamina o sol ajuda a produzir?",a:"VITAMINA D",opts:["Vitamina A","Vitamina C","Vitamina D","Vitamina K"]},
      {q:"Qual órgão é afetado pela hepatite?",a:"FIGADO",opts:["Rim","Fígado","Pulmão","Coração"]},
      {q:"Qual o tipo sanguíneo doador universal?",a:"O NEGATIVO",opts:["A+","O-","AB+","B-"]},
      {q:"Quantos dentes tem um adulto?",a:"32",opts:["28","30","32","34"]},
      {q:"Qual a temperatura corporal normal?",a:"36.5",opts:["35 °C","36,5 °C","38 °C","39 °C"]},
      {q:"Quem descobriu a penicilina?",a:"FLEMING",opts:["Pasteur","Fleming","Koch","Jenner"]}
        ]
        return startQuiz(from, sender, reply, bank, '⚕️ Quiz de medicina')
    }
};
