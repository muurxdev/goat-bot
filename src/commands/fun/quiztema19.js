/**
 * Comando .quiznobel — 🏅 QUIZ NOBEL
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quiznobel',
    aliases: ["quizpremionobel","quizlaureados"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz do Prêmio Nobel: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta do Prêmio Nobel; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Quem instituiu o Prêmio Nobel?", a: "ALFRED NOBEL", opts: ["Alfred Nobel","Albert Einstein","Louis Pasteur","Marie Curie"] },
            { q: "Que invenção deu a fortuna a Alfred Nobel?", a: "DINAMITE", opts: ["Dinamite","Telefone","Lâmpada","Motor"] },
            { q: "Quem foi a primeira mulher a ganhar um Nobel?", a: "MARIE CURIE", opts: ["Marie Curie","Rosalind Franklin","Ada Lovelace","Dorothy Hodgkin"] },
            { q: "Em que país é entregue o Nobel da Paz?", a: "NORUEGA", opts: ["Suécia","Noruega","Dinamarca","Suíça"] },
            { q: "Existe Prêmio Nobel de Matemática?", a: "NAO", opts: ["Sim","Não","Só desde 1990","Só honorário"] },
            { q: "Marie Curie ganhou o Nobel em quantas áreas diferentes?", a: "2", opts: ["1","2","3","4"] }
        ]
        return startQuiz(from, sender, reply, bank, '🏅 Quiz do Prêmio Nobel')
    }
}
