/**
 * Comando .quizidiomas — 🗣️ QUIZ IDIOMAS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizidiomas',
    aliases: ["quizlinguas","quizlinguistica"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de idiomas: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de idiomas; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual idioma tem mais falantes nativos no mundo?", a: "MANDARIM", opts: ["Inglês","Mandarim","Espanhol","Hindi"] },
            { q: "Qual é o idioma oficial do Brasil?", a: "PORTUGUES", opts: ["Português","Espanhol","Português e Espanhol","Nenhum oficial"] },
            { q: "Que alfabeto o russo utiliza?", a: "CIRILICO", opts: ["Latino","Cirílico","Grego","Árabe"] },
            { q: "Quantos idiomas oficiais tem a Suíça?", a: "4", opts: ["2","3","4","5"] },
            { q: "De qual família vem o português?", a: "LATINA", opts: ["Germânica","Latina","Eslava","Celta"] },
            { q: "Em que país se fala africâner além do inglês?", a: "AFRICA DO SUL", opts: ["Nigéria","África do Sul","Quênia","Angola"] }
        ]
        return startQuiz(from, sender, reply, bank, '🗣️ Quiz de idiomas')
    }
}
