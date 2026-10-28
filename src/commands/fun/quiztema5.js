/**
 * Comando .quizarquitetura — 🏛️ QUIZ ARQUITETURA
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizarquitetura',
    aliases: ["quizpredios","quizconstrucoes"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de arquitetura: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de arquitetura; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Em que cidade fica a Sagrada Família, de Gaudí?", a: "BARCELONA", opts: ["Madri","Barcelona","Valência","Sevilha"] },
            { q: "Quem projetou os principais prédios de Brasília?", a: "OSCAR NIEMEYER", opts: ["Lúcio Costa","Oscar Niemeyer","Paulo Mendes","Ruy Ohtake"] },
            { q: "Qual estilo arquitetônico tem arcos ogivais e vitrais altos?", a: "GOTICO", opts: ["Românico","Gótico","Barroco","Renascentista"] },
            { q: "Em que país fica o Taj Mahal?", a: "INDIA", opts: ["Paquistão","Índia","Irã","Turquia"] },
            { q: "Qual material tornou possível o arranha-céu moderno?", a: "ACO", opts: ["Concreto apenas","Aço","Madeira laminada","Alumínio"] },
            { q: "Quem cunhou a ideia de que \"a forma segue a função\"?", a: "LOUIS SULLIVAN", opts: ["Le Corbusier","Louis Sullivan","Frank Lloyd Wright","Mies van der Rohe"] }
        ]
        return startQuiz(from, sender, reply, bank, '🏛️ Quiz de arquitetura')
    }
}
