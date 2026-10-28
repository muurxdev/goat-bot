/**
 * Comando .quizastronautica — 🚀 QUIZ ASTRONÁUTICA
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizastronautica',
    aliases: ["quizespacial","quizfoguetes"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de astronáutica: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de astronáutica; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quem foi o primeiro ser humano a ir ao espaço?", a: "YURI GAGARIN", opts: ["Neil Armstrong","Yuri Gagarin","Alan Shepard","John Glenn"] },
            { q: "Em que ano o ser humano pisou na Lua pela primeira vez?", a: "1969", opts: ["1961","1965","1969","1972"] },
            { q: "Qual foi a primeira mulher a ir ao espaço?", a: "VALENTINA TERESHKOVA", opts: ["Sally Ride","Valentina Tereshkova","Mae Jemison","Yelena Serova"] },
            { q: "Qual o nome da estação espacial em órbita desde 1998?", a: "ISS", opts: ["Mir","ISS","Skylab","Tiangong"] },
            { q: "Qual agência espacial é dos Estados Unidos?", a: "NASA", opts: ["ESA","NASA","Roscosmos","JAXA"] },
            { q: "Quem foi o primeiro brasileiro no espaço?", a: "MARCOS PONTES", opts: ["Marcos Pontes","Carlos Nóbrega","Paulo Freire","Sérgio Rezende"] }
        ]
        return startQuiz(from, sender, reply, bank, '🚀 Quiz de astronáutica')
    }
}
