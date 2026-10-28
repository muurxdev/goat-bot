/**
 * Comando .quizrios — 🏞️ QUIZ RIOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizrios',
    aliases: ["quizhidrografia","quizaguas"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'QUIZ RIOS — responda no chat e ganhe XP e moedas',
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual é o rio de maior volume de água do mundo?", a: "AMAZONAS", opts: ["Nilo","Amazonas","Yangtzé","Mississippi"] },
            { q: "Que rio atravessa o Egito?", a: "NILO", opts: ["Nilo","Congo","Níger","Zambeze"] },
            { q: "Qual rio passa por Paris?", a: "SENA", opts: ["Sena","Loire","Ródano","Reno"] },
            { q: "Qual rio brasileiro é chamado de \"rio da integração nacional\"?", a: "SAO FRANCISCO", opts: ["Tietê","São Francisco","Paraná","Tocantins"] },
            { q: "Onde ficam as Cataratas do Iguaçu?", a: "BRASIL E ARGENTINA", opts: ["Brasil e Paraguai","Brasil e Argentina","Argentina e Uruguai","Só no Brasil"] },
            { q: "Como se chama o ponto onde um rio nasce?", a: "NASCENTE", opts: ["Foz","Nascente","Meandro","Delta"] }
        ]
        return startQuiz(from, sender, reply, bank, '🏞️ QUIZ RIOS')
    }
}
