/**
 * Comando .quizoceanos — 🌊 QUIZ OCEANOS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizoceanos',
    aliases: ["quizmares","quizmarinho"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de oceanos: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de oceanos; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual é o maior oceano do planeta?", a: "PACIFICO", opts: ["Atlântico","Pacífico","Índico","Ártico"] },
            { q: "Qual é o ponto mais profundo dos oceanos?", a: "FOSSA DAS MARIANAS", opts: ["Fossa das Marianas","Fossa de Porto Rico","Fossa do Japão","Fossa de Java"] },
            { q: "Qual é o maior animal que já existiu na Terra?", a: "BALEIA AZUL", opts: ["Baleia azul","Tubarão baleia","Cachalote","Megalodonte"] },
            { q: "Aproximadamente quanto da superfície da Terra é coberta por água?", a: "71%", opts: ["50%","61%","71%","85%"] },
            { q: "Qual oceano banha a costa do Brasil?", a: "ATLANTICO", opts: ["Pacífico","Atlântico","Índico","Antártico"] },
            { q: "O que causa as marés?", a: "A LUA", opts: ["O vento","A Lua","As correntes","A rotação apenas"] }
        ]
        return startQuiz(from, sender, reply, bank, '🌊 Quiz de oceanos')
    }
}
