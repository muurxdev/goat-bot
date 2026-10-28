/**
 * Comando .quizcachorros — 🐕 QUIZ CACHORROS
 *
 * Quiz temático sobre o quizEngine: aceita resposta livre no chat (número ou
 * texto) e premia com XP e moedas. As perguntas são fechadas e verificáveis.
 */

module.exports = {
    name: 'quizcachorros',
    aliases: ["quizcaes","quizracascaes"],
    category: 'fun',
    subcategory: 'Jogos & Quizzes',
    description: 'Quiz de cachorros: responda no chat e ganhe XP e moedas',
    examples: [' — sorteia uma pergunta de cachorros; responda no chat com o número ou o texto'],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
            { q: "Qual raça é conhecida como a menor do mundo?", a: "CHIHUAHUA", opts: ["Pinscher","Chihuahua","Yorkshire","Maltês"] },
            { q: "Qual raça é famosa por resgates na neve?", a: "SAO BERNARDO", opts: ["Husky","São Bernardo","Labrador","Pastor alemão"] },
            { q: "Qual raça é a mais usada como cão-guia?", a: "LABRADOR", opts: ["Poodle","Labrador","Rottweiler","Beagle"] },
            { q: "De que país é originário o Akita?", a: "JAPAO", opts: ["China","Japão","Coreia","Rússia"] },
            { q: "Qual raça tem a pelagem enrugada característica?", a: "SHAR PEI", opts: ["Pug","Shar Pei","Bulldog","Boxer"] },
            { q: "Quantos dentes tem um cão adulto?", a: "42", opts: ["32","38","42","48"] }
        ]
        return startQuiz(from, sender, reply, bank, '🐕 Quiz de cachorros')
    }
}
