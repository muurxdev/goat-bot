/**
 * Comando .quizvulcoes — 🌋 QUIZ VULCÕES
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizvulcoes',
    aliases: ["quizvulcanismo","quizterremotos"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'QUIZ VULCÕES — responda no chat e ganhe XP e moedas',
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Como se chama a rocha derretida ainda dentro da Terra?", a: "MAGMA", opts: ["Lava","Magma","Basalto","Piroclasto"] },
            { q: "E depois que sai à superfície, como se chama?", a: "LAVA", opts: ["Magma","Lava","Cinza","Escória"] },
            { q: "Qual escala mede a intensidade de terremotos?", a: "RICHTER", opts: ["Mohs","Richter","Beaufort","Saffir-Simpson"] },
            { q: "Que cidade romana foi soterrada pelo Vesúvio em 79 d.C.?", a: "POMPEIA", opts: ["Óstia","Pompeia","Cápua","Nápoles"] },
            { q: "Qual região concentra a maioria dos vulcões ativos?", a: "CÍRCULO DE FOGO DO PACÍFICO", opts: ["Círculo de Fogo do Pacífico","Cordilheira dos Andes","Rift Africano","Islândia"] },
            { q: "O que causa os terremotos?", a: "PLACAS TECTONICAS", opts: ["Marés","Placas tectônicas","Vento","Chuva"] }
        ]
        return startQuiz(from, sender, reply, bank, '🌋 QUIZ VULCÕES')
    }
}
