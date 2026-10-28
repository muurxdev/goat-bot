/**
 * Comando .quizaves — 🦅 QUIZ AVES
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizaves',
    aliases: ["quizpassaros","quizornitologia"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'QUIZ AVES — responda no chat e ganhe XP e moedas',
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual é a ave que voa mais rápido em mergulho?", a: "FALCAO PEREGRINO", opts: ["Águia","Falcão peregrino","Andorinha","Albatroz"] },
            { q: "Qual é a maior ave do mundo?", a: "AVESTRUZ", opts: ["Emu","Avestruz","Condor","Albatroz"] },
            { q: "Qual ave é o símbolo do Brasil?", a: "SABIÁ-LARANJEIRA", opts: ["Arara-azul","Sabiá-laranjeira","Tucano","Bem-te-vi"] },
            { q: "Pinguins conseguem voar?", a: "NAO", opts: ["Sim","Não","Só filhotes","Só em fuga"] },
            { q: "Qual ave é conhecida por imitar sons e vozes?", a: "PAPAGAIO", opts: ["Papagaio","Pardal","Pomba","Gaivota"] },
            { q: "Qual ave brasileira tem bico grande e colorido?", a: "TUCANO", opts: ["Tucano","Gavião","Coruja","João-de-barro"] }
        ]
        return startQuiz(from, sender, reply, bank, '🦅 QUIZ AVES')
    }
}
