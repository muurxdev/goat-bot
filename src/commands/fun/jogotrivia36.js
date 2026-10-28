/**
 * Comando .quizdisney — QUIZ DISNEY
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia36`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizdisney",
    aliases: ["disneyquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz da Disney: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta da Disney; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual princesa perdeu um sapatinho?",a:"CINDERELA",opts:["Branca de Neve","Cinderela","Aurora","Bela"]},
      {q:"Qual o nome do leão de 'O Rei Leão'?",a:"SIMBA",opts:["Mufasa","Simba","Scar","Nala"]},
      {q:"Qual boneco de neve é de 'Frozen'?",a:"OLAF",opts:["Sven","Olaf","Kristoff","Hans"]},
      {q:"Quem é o rato símbolo da Disney?",a:"MICKEY",opts:["Minnie","Mickey","Pateta","Donald"]},
      {q:"Em 'Aladdin', qual o nome do gênio?",a:"GENIO",opts:["Jafar","Gênio","Abu","Iago"]},
      {q:"Qual peixe-palhaço se perde no mar?",a:"NEMO",opts:["Dory","Nemo","Marlin","Bruce"]}
        ]
        return startQuiz(from, sender, reply, bank, '🏰 Quiz da Disney')
    }
};
