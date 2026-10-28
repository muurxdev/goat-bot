/**
 * Comando .quizportugues — QUIZ PORTUGUÊS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia3`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizportugues",
    aliases: ["portuguesquiz","quizgramatica"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de português: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de português; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual é o plural de 'cidadão'?",a:"CIDADAOS",opts:["Cidadães","Cidadãos","Cidadões","Cidadãos e cidadães"]},
      {q:"'Mal' e 'mau' — qual é o oposto de 'bom'?",a:"MAU",opts:["Mal","Mau","Ambos","Nenhum"]},
      {q:"Quantas letras tem o alfabeto português oficial?",a:"26",opts:["23","24","26","27"]},
      {q:"Qual palavra está correta?",a:"EXCEÇÃO",opts:["Esceção","Exceção","Excessão","Eceção"]},
      {q:"'Onde' ou 'aonde' — qual indica movimento?",a:"AONDE",opts:["Onde","Aonde","Os dois","Nenhum"]},
      {q:"Qual é o coletivo de lobos?",a:"ALCATEIA",opts:["Matilha","Alcateia","Bando","Cardume"]}
        ]
        return startQuiz(from, sender, reply, bank, '📝 Quiz de português')
    }
};
