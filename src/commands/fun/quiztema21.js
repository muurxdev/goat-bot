/**
 * Comando .quizxadrez — ♟️ QUIZ XADREZ
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizxadrez',
    aliases: ["quizchess","quiztabuleiro"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de xadrez: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de xadrez; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quantas casas tem um tabuleiro de xadrez?", a: "64", opts: ["36","49","64","81"] },
            { q: "Qual peça se move em L?", a: "CAVALO", opts: ["Bispo","Cavalo","Torre","Dama"] },
            { q: "Qual é a peça mais poderosa do jogo?", a: "DAMA", opts: ["Rei","Dama","Torre","Bispo"] },
            { q: "Como se chama o fim de jogo em que o rei não tem escapatória?", a: "XEQUE-MATE", opts: ["Xeque","Xeque-mate","Afogamento","Empate"] },
            { q: "Quantos peões cada jogador tem no início?", a: "8", opts: ["6","8","10","16"] },
            { q: "Qual cor sempre começa a partida?", a: "BRANCAS", opts: ["Brancas","Pretas","Sorteio","Quem desafiou"] }
        ]
        return startQuiz(from, sender, reply, bank, '♟️ Quiz de xadrez')
    }
}
