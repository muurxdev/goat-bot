/**
 * Comando .quizinsetos — 🐝 QUIZ INSETOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizinsetos',
    aliases: ["quizinsetario","quizentomologia"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de insetos: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de insetos; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quantas patas tem um inseto adulto?", a: "6", opts: ["4","6","8","10"] },
            { q: "Qual inseto produz o mel?", a: "ABELHA", opts: ["Vespa","Abelha","Formiga","Besouro"] },
            { q: "Aranha é inseto?", a: "NAO", opts: ["Sim","Não","Só algumas","Depende"] },
            { q: "Qual inseto transmite a dengue?", a: "AEDES AEGYPTI", opts: ["Anopheles","Aedes aegypti","Culex","Barbeiro"] },
            { q: "Qual é a fase entre a lagarta e a borboleta?", a: "PUPA", opts: ["Larva","Pupa","Ninfa","Ovo"] },
            { q: "Qual inseto vive em colônias com rainha, operárias e soldados?", a: "FORMIGA", opts: ["Mosca","Formiga","Grilo","Libélula"] }
        ]
        return startQuiz(from, sender, reply, bank, '🐝 Quiz de insetos')
    }
}
