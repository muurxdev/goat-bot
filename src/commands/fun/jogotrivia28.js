/**
 * Comando .quizeconomia — QUIZ ECONOMIA
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia28`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizeconomia",
    aliases: ["economiaquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de economia: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de economia; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"O que significa inflação?",a:"AUMENTO DE PRECOS",opts:["Aumento de preços","Queda de preços","Aumento de salário","Queda de juros"]},
      {q:"Qual a moeda do Japão?",a:"IENE",opts:["Yuan","Iene","Won","Dólar"]},
      {q:"O que é o PIB?",a:"PRODUTO INTERNO BRUTO",opts:["Produto Interno Bruto","Preço Interno Base","Plano Industrial Brasileiro","Programa de Investimento"]},
      {q:"Qual banco emite o Real?",a:"BANCO CENTRAL",opts:["Banco do Brasil","Banco Central","Caixa","Itaú"]},
      {q:"O que é a Selic?",a:"TAXA BASICA DE JUROS",opts:["Taxa básica de juros","Imposto federal","Índice de inflação","Bolsa de valores"]},
      {q:"Qual a moeda da União Europeia?",a:"EURO",opts:["Libra","Euro","Franco","Marco"]}
        ]
        return startQuiz(from, sender, reply, bank, '💹 Quiz de economia')
    }
};
