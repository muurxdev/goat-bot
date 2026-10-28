/**
 * Comando .quizfrutas — 🍎 QUIZ FRUTAS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizfrutas',
    aliases: ["quizfruta","quizpomar"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de frutas: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de frutas; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual fruta é conhecida como rica em vitamina C?", a: "ACEROLA", opts: ["Banana","Acerola","Melancia","Pera"] },
            { q: "Botanicamente, o tomate é fruta ou legume?", a: "FRUTA", opts: ["Fruta","Legume","Verdura","Tubérculo"] },
            { q: "Qual fruta tem as sementes por fora?", a: "MORANGO", opts: ["Morango","Uva","Kiwi","Maracujá"] },
            { q: "De que planta vem o abacaxi?", a: "BROMELIA", opts: ["Palmeira","Bromélia","Cacto","Arbusto"] },
            { q: "Qual fruta é a base do azeite?", a: "AZEITONA", opts: ["Abacate","Azeitona","Coco","Amêndoa"] },
            { q: "Qual destas é uma fruta típica do cerrado brasileiro?", a: "PEQUI", opts: ["Pequi","Lichia","Caqui","Figo"] }
        ]
        return startQuiz(from, sender, reply, bank, '🍎 Quiz de frutas')
    }
}
