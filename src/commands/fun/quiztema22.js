/**
 * Comando .quizinstrumentos — 🎻 QUIZ INSTRUMENTOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizinstrumentos',
    aliases: ["quizmusicais","quizorquestra"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de instrumentos: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de instrumentos; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quantas cordas tem um violão tradicional?", a: "6", opts: ["4","5","6","7"] },
            { q: "A qual família pertence o saxofone?", a: "SOPRO", opts: ["Cordas","Sopro","Percussão","Teclas"] },
            { q: "Qual instrumento tem 88 teclas?", a: "PIANO", opts: ["Órgão","Piano","Acordeão","Cravo"] },
            { q: "Qual instrumento brasileiro é típico do samba e tem som grave?", a: "SURDO", opts: ["Pandeiro","Surdo","Cuíca","Tamborim"] },
            { q: "Qual é o instrumento mais agudo da família das cordas na orquestra?", a: "VIOLINO", opts: ["Violino","Viola","Violoncelo","Contrabaixo"] },
            { q: "Berimbau é usado principalmente em qual prática brasileira?", a: "CAPOEIRA", opts: ["Frevo","Capoeira","Maracatu","Forró"] }
        ]
        return startQuiz(from, sender, reply, bank, '🎻 Quiz de instrumentos')
    }
}
