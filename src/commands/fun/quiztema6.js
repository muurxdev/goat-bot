/**
 * Comando .quizcafe — ☕ QUIZ CAFÉ
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizcafe',
    aliases: ["quizcafeina","quizbarista"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'QUIZ CAFÉ — responda no chat e ganhe XP e moedas',
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual país é o maior produtor de café do mundo?", a: "BRASIL", opts: ["Colômbia","Brasil","Vietnã","Etiópia"] },
            { q: "Qual espécie de café é considerada de qualidade superior?", a: "ARABICA", opts: ["Robusta","Arábica","Libérica","Excelsa"] },
            { q: "De que país é originário o café?", a: "ETIOPIA", opts: ["Brasil","Etiópia","Iêmen","Turquia"] },
            { q: "O que é um espresso?", a: "CAFE SOB PRESSAO", opts: ["Café filtrado","Café sob pressão","Café gelado","Café solúvel"] },
            { q: "Qual bebida leva espresso e leite vaporizado em partes próximas?", a: "CAPPUCCINO", opts: ["Americano","Cappuccino","Ristretto","Macchiato"] },
            { q: "Qual grão tem mais cafeína?", a: "ROBUSTA", opts: ["Arábica","Robusta","Ambos iguais","Depende da torra"] }
        ]
        return startQuiz(from, sender, reply, bank, '☕ QUIZ CAFÉ')
    }
}
