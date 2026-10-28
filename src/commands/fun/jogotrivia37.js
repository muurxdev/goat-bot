/**
 * Comando .quizharrypotter — QUIZ HARRY POTTER
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia37`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizharrypotter",
    aliases: ["hpquiz","potterquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de Harry Potter: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de Harry Potter; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual a casa de Harry em Hogwarts?",a:"GRIFINORIA",opts:["Sonserina","Grifinória","Corvinal","Lufa-Lufa"]},
      {q:"Qual o nome da coruja do Harry?",a:"EDWIGES",opts:["Errol","Edwiges","Pichitinho","Fofo"]},
      {q:"Quem é o vilão principal da série?",a:"VOLDEMORT",opts:["Snape","Voldemort","Malfoy","Umbridge"]},
      {q:"Qual esporte é jogado com vassouras?",a:"QUADRIBOL",opts:["Quadribol","Xadrez Bruxo","Snap Explosivo","Gobstones"]},
      {q:"Qual o nome do diretor de Hogwarts?",a:"DUMBLEDORE",opts:["Snape","Dumbledore","McGonagall","Flitwick"]},
      {q:"Quantos Horcruxes Voldemort criou (originalmente)?",a:"7",opts:["5","6","7","8"]}
        ]
        return startQuiz(from, sender, reply, bank, '⚡ Quiz de Harry Potter')
    }
};
