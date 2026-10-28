/**
 * Comando .quizplantas — 🌱 QUIZ PLANTAS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizplantas',
    aliases: ["quizbotanica","quizvegetais"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de plantas: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de plantas; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual processo as plantas usam para produzir energia?", a: "FOTOSSINTESE", opts: ["Respiração","Fotossíntese","Fermentação","Digestão"] },
            { q: "Qual pigmento dá a cor verde às folhas?", a: "CLOROFILA", opts: ["Caroteno","Clorofila","Antocianina","Xantofila"] },
            { q: "Qual é a maior árvore do mundo em volume?", a: "SEQUOIA", opts: ["Baobá","Sequoia","Eucalipto","Carvalho"] },
            { q: "Qual gás as plantas absorvem na fotossíntese?", a: "GAS CARBONICO", opts: ["Oxigênio","Gás carbônico","Nitrogênio","Hidrogênio"] },
            { q: "Qual árvore deu nome ao Brasil?", a: "PAU-BRASIL", opts: ["Ipê","Pau-brasil","Jequitibá","Araucária"] },
            { q: "Cactos armazenam água principalmente em qual parte?", a: "CAULE", opts: ["Raiz","Caule","Folhas","Flores"] }
        ]
        return startQuiz(from, sender, reply, bank, '🌱 Quiz de plantas')
    }
}
