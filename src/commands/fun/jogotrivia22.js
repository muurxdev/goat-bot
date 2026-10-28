/**
 * Comando .quizemojis — QUIZ EMOJIS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia22`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizemojis",
    aliases: ["emojisquiz","quizemoji"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de emojis: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de emojis; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"🍎 + 📱 = qual marca?",a:"APPLE",opts:["Samsung","Apple","Xiaomi","Motorola"]},
      {q:"🦁 + 👑 = qual filme?",a:"O REI LEAO",opts:["Madagascar","O Rei Leão","Zootopia","Tarzan"]},
      {q:"🕷️ + 👨 = qual herói?",a:"HOMEM ARANHA",opts:["Batman","Homem-Aranha","Superman","Hulk"]},
      {q:"⭐ + ⚔️ = qual saga?",a:"STAR WARS",opts:["Star Trek","Star Wars","Marvel","Senhor dos Anéis"]},
      {q:"🐭 + 🎩 = qual personagem?",a:"MICKEY",opts:["Jerry","Mickey","Stuart Little","Pluto"]},
      {q:"🌊 + 🚢 + 🧊 = qual filme?",a:"TITANIC",opts:["Poseidon","Titanic","Náufrago","Mar em Fúria"]}
        ]
        return startQuiz(from, sender, reply, bank, '😀 Quiz de emojis')
    }
};
