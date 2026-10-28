/**
 * Comando .quizquadrinhos — 📚 QUIZ QUADRINHOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizquadrinhos',
    aliases: ["quizhq","quizcomics"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de quadrinhos: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de quadrinhos; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quem criou a Turma da Mônica?", a: "MAURICIO DE SOUSA", opts: ["Ziraldo","Maurício de Sousa","Laerte","Henfil"] },
            { q: "Qual editora publica o Homem-Aranha?", a: "MARVEL", opts: ["DC","Marvel","Image","Dark Horse"] },
            { q: "Qual é a cidade fictícia do Batman?", a: "GOTHAM", opts: ["Metropolis","Gotham","Central City","Star City"] },
            { q: "Quem escreveu \"O Menino Maluquinho\"?", a: "ZIRALDO", opts: ["Ziraldo","Maurício de Sousa","Monteiro Lobato","Ruth Rocha"] },
            { q: "Qual super-herói é conhecido como o Homem de Aço?", a: "SUPERMAN", opts: ["Batman","Superman","Flash","Lanterna Verde"] },
            { q: "Do que é feito o escudo do Capitão América nos quadrinhos?", a: "VIBRANIUM", opts: ["Adamantium","Vibranium","Aço","Uru"] }
        ]
        return startQuiz(from, sender, reply, bank, '📚 Quiz de quadrinhos')
    }
}
