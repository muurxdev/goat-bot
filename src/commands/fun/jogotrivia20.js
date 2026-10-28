/**
 * Comando .quizcharadas — QUIZ CHARADAS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia20`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizcharadas",
    aliases: ["charadasquiz","quizenigma"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de charadas: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de charadas; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"O que tem cabeça e cauda mas não tem corpo?",a:"MOEDA",opts:["Cobra","Moeda","Peixe","Avião"]},
      {q:"O que sobe mas nunca desce?",a:"IDADE",opts:["Balão","Idade","Fumaça","Preço"]},
      {q:"Quanto mais se tira, maior fica. O que é?",a:"BURACO",opts:["Bolo","Buraco","Dinheiro","Areia"]},
      {q:"O que anda com os pés na cabeça?",a:"PIOLHO",opts:["Formiga","Piolho","Aranha","Pulga"]},
      {q:"Tem dentes mas não morde. O que é?",a:"PENTE",opts:["Serra","Pente","Garfo","Chave"]},
      {q:"O que fica mais molhado quanto mais seca?",a:"TOALHA",opts:["Esponja","Toalha","Papel","Roupa"]}
        ]
        return startQuiz(from, sender, reply, bank, '🧩 Quiz de charadas')
    }
};
