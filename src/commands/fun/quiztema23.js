/**
 * Comando .quizpintores — 🎨 QUIZ PINTORES
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizpintores',
    aliases: ["quizpintura","quizartistas"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de pintores: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de pintores; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quem pintou a Mona Lisa?", a: "LEONARDO DA VINCI", opts: ["Michelangelo","Leonardo da Vinci","Rafael","Botticelli"] },
            { q: "Quem pintou \"A Noite Estrelada\"?", a: "VAN GOGH", opts: ["Monet","Van Gogh","Cézanne","Gauguin"] },
            { q: "Qual pintora mexicana é famosa pelos autorretratos?", a: "FRIDA KAHLO", opts: ["Frida Kahlo","Tarsila do Amaral","Anita Malfatti","Georgia O.Keeffe"] },
            { q: "Quem pintou \"Abaporu\"?", a: "TARSILA DO AMARAL", opts: ["Anita Malfatti","Tarsila do Amaral","Di Cavalcanti","Portinari"] },
            { q: "Qual movimento Picasso ajudou a criar?", a: "CUBISMO", opts: ["Impressionismo","Cubismo","Surrealismo","Expressionismo"] },
            { q: "Quem pintou o teto da Capela Sistina?", a: "MICHELANGELO", opts: ["Rafael","Michelangelo","Da Vinci","Caravaggio"] }
        ]
        return startQuiz(from, sender, reply, bank, '🎨 Quiz de pintores')
    }
}
