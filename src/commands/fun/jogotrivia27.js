/**
 * Comando .quizreligiao — QUIZ RELIGIÕES
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia27`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizreligiao",
    aliases: ["religiaoquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de religiões: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de religiões; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o livro sagrado do Islã?",a:"ALCORAO",opts:["Bíblia","Alcorão","Torá","Vedas"]},
      {q:"Qual religião tem mais seguidores no mundo?",a:"CRISTIANISMO",opts:["Islamismo","Cristianismo","Hinduísmo","Budismo"]},
      {q:"Quem fundou o budismo?",a:"BUDA",opts:["Confúcio","Buda","Lao Tsé","Krishna"]},
      {q:"Qual o livro sagrado do judaísmo?",a:"TORA",opts:["Talmude","Torá","Alcorão","Bíblia"]},
      {q:"Qual cidade é sagrada para 3 religiões?",a:"JERUSALEM",opts:["Meca","Jerusalém","Roma","Belém"]},
      {q:"Quantos livros tem a Bíblia católica?",a:"73",opts:["66","70","73","77"]}
        ]
        return startQuiz(from, sender, reply, bank, '🕊️ Quiz de religiões')
    }
};
