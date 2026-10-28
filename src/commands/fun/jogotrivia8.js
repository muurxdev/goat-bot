/**
 * Comando .quizbiologia — QUIZ BIOLOGIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia8`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizbiologia",
    aliases: ["biologiaquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de biologia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de biologia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual organela produz energia na célula?",a:"MITOCONDRIA",opts:["Núcleo","Mitocôndria","Ribossomo","Lisossomo"]},
      {q:"Quantos cromossomos tem o ser humano?",a:"46",opts:["23","44","46","48"]},
      {q:"Qual processo as plantas usam para produzir alimento?",a:"FOTOSSINTESE",opts:["Respiração","Fotossíntese","Fermentação","Digestão"]},
      {q:"Quem propôs a Teoria da Evolução?",a:"DARWIN",opts:["Lamarck","Darwin","Mendel","Pasteur"]},
      {q:"Qual a molécula que carrega a informação genética?",a:"DNA",opts:["RNA","DNA","ATP","Proteína"]},
      {q:"Qual o maior animal do mundo?",a:"BALEIA AZUL",opts:["Elefante","Baleia azul","Tubarão baleia","Girafa"]}
        ]
        return startQuiz(from, sender, reply, bank, '🧬 Quiz de biologia')
    }
};
