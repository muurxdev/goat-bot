/**
 * Comando .quizmonumentos — 🗽 QUIZ MONUMENTOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizmonumentos',
    aliases: ["quizpontosturisticos","quizmaravilhas"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de monumentos: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de monumentos; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Em que cidade fica o Cristo Redentor?", a: "RIO DE JANEIRO", opts: ["São Paulo","Rio de Janeiro","Salvador","Recife"] },
            { q: "Qual país deu a Estátua da Liberdade aos EUA?", a: "FRANCA", opts: ["Inglaterra","França","Espanha","Itália"] },
            { q: "Onde fica Machu Picchu?", a: "PERU", opts: ["Bolívia","Peru","Equador","Chile"] },
            { q: "Qual monumento fica no Egito e é a única das sete maravilhas antigas ainda de pé?", a: "PIRAMIDE DE GIZE", opts: ["Esfinge","Pirâmide de Gizé","Templo de Luxor","Vale dos Reis"] },
            { q: "Em que cidade fica o Coliseu?", a: "ROMA", opts: ["Atenas","Roma","Milão","Nápoles"] },
            { q: "Qual muralha é visível em imagens de satélite e fica na Ásia?", a: "MURALHA DA CHINA", opts: ["Muralha de Adriano","Muralha da China","Muralha de Jericó","Muralha de Berlim"] }
        ]
        return startQuiz(from, sender, reply, bank, '🗽 Quiz de monumentos')
    }
}
