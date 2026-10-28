/**
 * Comando .quiztecnologia — QUIZ TECNOLOGIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia16`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quiztecnologia",
    aliases: ["tecnologiaquiz","quiztech"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de tecnologia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de tecnologia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"O que significa 'CPU'?",a:"UNIDADE CENTRAL DE PROCESSAMENTO",opts:["Central Processing Unit","Computer Power Unit","Control Program Unit","Core Process Unit"]},
      {q:"Quem fundou a Microsoft?",a:"BILL GATES",opts:["Steve Jobs","Bill Gates","Larry Page","Mark Zuckerberg"]},
      {q:"Quantos bits tem um byte?",a:"8",opts:["4","8","16","32"]},
      {q:"Qual empresa criou o Android?",a:"GOOGLE",opts:["Apple","Google","Samsung","Microsoft"]},
      {q:"O que significa 'RAM'?",a:"MEMORIA DE ACESSO ALEATORIO",opts:["Random Access Memory","Read Access Memory","Rapid Access Module","Remote Access Memory"]},
      {q:"Qual foi o primeiro iPhone lançado?",a:"2007",opts:["2005","2007","2009","2010"]}
        ]
        return startQuiz(from, sender, reply, bank, '💻 Quiz de tecnologia')
    }
};
