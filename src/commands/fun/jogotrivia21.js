/**
 * Comando .quizproverbios — QUIZ PROVÉRBIOS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia21`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizproverbios",
    aliases: ["proverbiosquiz","quizditados"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de provérbios: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de provérbios; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"'Quem com ferro fere...'",a:"COM FERRO SERA FERIDO",opts:["com ferro será ferido","de ferro morre","ferro leva","não se salva"]},
      {q:"'Água mole em pedra dura...'",a:"TANTO BATE ATE QUE FURA",opts:["tanto bate até que fura","sempre vence","nunca cede","fica dura"]},
      {q:"'Antes só...'",a:"DO QUE MAL ACOMPANHADO",opts:["do que mal acompanhado","do que nada","que triste","do que junto"]},
      {q:"'Quem não tem cão...'",a:"CACA COM GATO",opts:["caça com gato","fica em casa","não caça","compra um"]},
      {q:"'De grão em grão...'",a:"A GALINHA ENCHE O PAPO",opts:["a galinha enche o papo","faz-se o pão","cresce o saco","vem a fartura"]},
      {q:"'Mais vale um pássaro na mão...'",a:"DO QUE DOIS VOANDO",opts:["do que dois voando","do que nenhum","na gaiola","que dois na mata"]}
        ]
        return startQuiz(from, sender, reply, bank, '📜 Quiz de provérbios')
    }
};
