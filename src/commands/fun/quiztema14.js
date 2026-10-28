/**
 * Comando .quizdesertos — 🏜️ QUIZ DESERTOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizdesertos',
    aliases: ["quizaridos","quizsaara"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de desertos: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de desertos; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual é o maior deserto quente do mundo?", a: "SAARA", opts: ["Gobi","Saara","Kalahari","Atacama"] },
            { q: "Qual é considerado o lugar mais seco da Terra?", a: "ATACAMA", opts: ["Saara","Atacama","Vale da Morte","Gobi"] },
            { q: "Em que continente fica o deserto de Gobi?", a: "ASIA", opts: ["África","Ásia","Oceania","América"] },
            { q: "Tecnicamente, qual é o maior deserto do planeta?", a: "ANTARTIDA", opts: ["Saara","Antártida","Ártico","Arábia"] },
            { q: "Qual animal é chamado de \"navio do deserto\"?", a: "CAMELO", opts: ["Cavalo","Camelo","Burro","Cabra"] },
            { q: "O que define um deserto?", a: "POUCA CHUVA", opts: ["Muito calor","Pouca chuva","Ter areia","Não ter plantas"] }
        ]
        return startQuiz(from, sender, reply, bank, '🏜️ Quiz de desertos')
    }
}
