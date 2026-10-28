/**
 * Comando .quizdinossauros — 🦕 QUIZ DINOSSAUROS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizdinossauros',
    aliases: ["quizdino","quizjurassico"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de dinossauros: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de dinossauros; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual dinossauro tinha placas ósseas nas costas?", a: "ESTEGOSSAURO", opts: ["Triceratops","Estegossauro","Velociraptor","Braquiossauro"] },
            { q: "O que significa a palavra \"dinossauro\"?", a: "LAGARTO TERRIVEL", opts: ["Lagarto terrível","Réptil antigo","Grande besta","Monstro da terra"] },
            { q: "Qual dinossauro tinha três chifres?", a: "TRICERATOPS", opts: ["Estegossauro","Triceratops","Alossauro","Iguanodonte"] },
            { q: "O Tiranossauro rex era herbívoro ou carnívoro?", a: "CARNIVORO", opts: ["Herbívoro","Carnívoro","Onívoro","Insetívoro"] },
            { q: "Qual era o pescoço mais longo entre estes?", a: "BRAQUIOSSAURO", opts: ["Braquiossauro","Velociraptor","Espinossauro","Anquilossauro"] },
            { q: "Que evento é apontado como causa da extinção dos dinossauros?", a: "METEORO", opts: ["Vulcões apenas","Meteoro","Era glacial","Doença"] }
        ]
        return startQuiz(from, sender, reply, bank, '🦕 Quiz de dinossauros')
    }
}
