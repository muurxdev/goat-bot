/**
 * Comando .quizminerais — 💎 QUIZ MINERAIS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizminerais',
    aliases: ["quizpedras","quizgeologia"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de minerais: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de minerais; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual é o mineral natural mais duro conhecido?", a: "DIAMANTE", opts: ["Quartzo","Diamante","Coríndon","Topázio"] },
            { q: "De que elemento o diamante é feito?", a: "CARBONO", opts: ["Silício","Carbono","Alumínio","Cálcio"] },
            { q: "Qual escala mede a dureza dos minerais?", a: "MOHS", opts: ["Richter","Mohs","Beaufort","Kelvin"] },
            { q: "Qual pedra preciosa é vermelha?", a: "RUBI", opts: ["Safira","Rubi","Esmeralda","Topázio"] },
            { q: "Qual mineral é a principal fonte de alumínio?", a: "BAUXITA", opts: ["Hematita","Bauxita","Galena","Calcita"] },
            { q: "Qual mineral é o mais comum na crosta terrestre?", a: "FELDSPATO", opts: ["Quartzo","Feldspato","Mica","Calcita"] }
        ]
        return startQuiz(from, sender, reply, bank, '💎 Quiz de minerais')
    }
}
