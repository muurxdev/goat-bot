/**
 * Comando .quizmoedas — 💱 QUIZ MOEDAS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizmoedas',
    aliases: ["quizdinheiro","quizcambio"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de moedas: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de moedas; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual é a moeda do Japão?", a: "IENE", opts: ["Won","Iene","Yuan","Rupia"] },
            { q: "Qual moeda é usada na maior parte da União Europeia?", a: "EURO", opts: ["Libra","Euro","Franco","Marco"] },
            { q: "Qual era a moeda do Brasil antes do Real?", a: "CRUZEIRO REAL", opts: ["Cruzado","Cruzeiro real","Cruzeiro novo","Mil-réis"] },
            { q: "Qual é a moeda do Reino Unido?", a: "LIBRA ESTERLINA", opts: ["Euro","Libra esterlina","Coroa","Dólar"] },
            { q: "Em que ano o Real foi criado?", a: "1994", opts: ["1986","1990","1994","1999"] },
            { q: "Qual país usa o Peso e fica na América do Sul?", a: "ARGENTINA", opts: ["Brasil","Argentina","Equador","Guiana"] }
        ]
        return startQuiz(from, sender, reply, bank, '💱 Quiz de moedas')
    }
}
