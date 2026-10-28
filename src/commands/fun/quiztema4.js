/**
 * Comando .quizinventos — 💡 QUIZ INVENÇÕES
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizinventos',
    aliases: ["quizinvencoes","quizinventores"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de invenções: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de invenções; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quem é creditado pela invenção da lâmpada incandescente comercial?", a: "THOMAS EDISON", opts: ["Nikola Tesla","Thomas Edison","Alexander Bell","Michael Faraday"] },
            { q: "Quem inventou a imprensa de tipos móveis na Europa?", a: "GUTENBERG", opts: ["Gutenberg","Da Vinci","Galileu","Newton"] },
            { q: "Qual brasileiro é reconhecido como pai da aviação no Brasil?", a: "SANTOS DUMONT", opts: ["Santos Dumont","Bartolomeu de Gusmão","César Lattes","Oswaldo Cruz"] },
            { q: "Quem desenvolveu a primeira vacina, contra a varíola?", a: "EDWARD JENNER", opts: ["Louis Pasteur","Edward Jenner","Robert Koch","Alexander Fleming"] },
            { q: "Quem descobriu a penicilina?", a: "ALEXANDER FLEMING", opts: ["Alexander Fleming","Marie Curie","Louis Pasteur","Joseph Lister"] },
            { q: "Que invenção de Tim Berners-Lee mudou a comunicação em 1989?", a: "WEB", opts: ["E-mail","Web","Telefone celular","Satélite"] }
        ]
        return startQuiz(from, sender, reply, bank, '💡 Quiz de invenções')
    }
}
