/**
 * Comando .quizarte — QUIZ ARTE
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia11`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizarte",
    aliases: ["artequiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "QUIZ ARTE — responda no chat e ganhe XP e Coins",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Quem pintou a Mona Lisa?",a:"DA VINCI",opts:["Michelangelo","Da Vinci","Rafael","Donatello"]},
      {q:"Quem pintou 'A Noite Estrelada'?",a:"VAN GOGH",opts:["Monet","Van Gogh","Picasso","Dalí"]},
      {q:"Qual movimento Picasso ajudou a criar?",a:"CUBISMO",opts:["Impressionismo","Cubismo","Surrealismo","Barroco"]},
      {q:"Quem esculpiu o 'Davi'?",a:"MICHELANGELO",opts:["Da Vinci","Michelangelo","Rodin","Bernini"]},
      {q:"Quem pintou 'Abaporu'?",a:"TARSILA DO AMARAL",opts:["Anita Malfatti","Tarsila do Amaral","Portinari","Di Cavalcanti"]},
      {q:"Onde fica o museu do Louvre?",a:"PARIS",opts:["Londres","Paris","Roma","Madrid"]}
        ]
        return startQuiz(from, sender, reply, bank, '🎨 QUIZ ARTE')
    }
};
