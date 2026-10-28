/**
 * Comando .quizdireito — QUIZ DIREITO
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia31`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizdireito",
    aliases: ["direitoquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de direito: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de direito; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual a lei máxima do Brasil?",a:"CONSTITUICAO",opts:["Código Civil","Constituição","Código Penal","CLT"]},
      {q:"Em que ano foi promulgada a Constituição atual?",a:"1988",opts:["1964","1985","1988","1990"]},
      {q:"O que significa 'CLT'?",a:"CONSOLIDACAO DAS LEIS DO TRABALHO",opts:["Consolidação das Leis do Trabalho","Código Legal Trabalhista","Carteira Legal do Trabalhador","Contrato Legal de Trabalho"]},
      {q:"Qual a idade de imputabilidade penal no Brasil?",a:"18",opts:["16","18","21","14"]},
      {q:"O que é habeas corpus?",a:"GARANTIA DE LIBERDADE",opts:["Garantia de liberdade","Direito de propriedade","Direito de voto","Ação de cobrança"]},
      {q:"Quantas horas é a jornada semanal padrão na CLT?",a:"44",opts:["40","42","44","48"]}
        ]
        return startQuiz(from, sender, reply, bank, '⚖️ Quiz de direito')
    }
};
