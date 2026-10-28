/**
 * Comando .quizolimpiadas — 🥇 QUIZ OLIMPÍADAS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizolimpiadas',
    aliases: ["quizolimpico","quizjogosolimpicos"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz das Olimpíadas: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta das Olimpíadas; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Em que país nasceram os Jogos Olímpicos?", a: "GRECIA", opts: ["Itália","Grécia","Egito","Turquia"] },
            { q: "Quantos anéis tem o símbolo olímpico?", a: "5", opts: ["4","5","6","7"] },
            { q: "De quantos em quantos anos acontecem as Olimpíadas de verão?", a: "4", opts: ["2","3","4","5"] },
            { q: "Qual cidade brasileira sediou as Olimpíadas de 2016?", a: "RIO DE JANEIRO", opts: ["São Paulo","Rio de Janeiro","Brasília","Salvador"] },
            { q: "O que os anéis olímpicos representam?", a: "OS CONTINENTES", opts: ["As modalidades","Os continentes","Os fundadores","As medalhas"] },
            { q: "Qual modalidade encerra tradicionalmente a Olimpíada?", a: "MARATONA", opts: ["Natação","Maratona","Ginástica","Basquete"] }
        ]
        return startQuiz(from, sender, reply, bank, '🥇 Quiz das Olimpíadas')
    }
}
