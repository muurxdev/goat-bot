/**
 * Comando .quizonepiece — QUIZ ONE PIECE
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia42`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizonepiece",
    aliases: ["onepiecequiz","opquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de One Piece: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de One Piece; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual o sonho do Luffy?",a:"REI DOS PIRATAS",opts:["Achar o All Blue","Rei dos Piratas","Melhor espadachim","Mapear o mundo"]},
      {q:"Qual a fruta do diabo do Luffy?",a:"GOMU GOMU",opts:["Mera Mera","Gomu Gomu","Hito Hito","Ope Ope"]},
      {q:"Quem é o espadachim do bando?",a:"ZORO",opts:["Sanji","Zoro","Usopp","Brook"]},
      {q:"Qual o nome do navio principal do bando?",a:"THOUSAND SUNNY",opts:["Going Merry","Thousand Sunny","Oro Jackson","Red Force"]},
      {q:"Quem é o cozinheiro do bando?",a:"SANJI",opts:["Zoro","Sanji","Chopper","Franky"]},
      {q:"Qual o tesouro que dá nome à obra?",a:"ONE PIECE",opts:["Poneglifo","One Piece","Rio Poneglyph","Pluton"]}
        ]
        return startQuiz(from, sender, reply, bank, '🏴‍☠️ Quiz de One Piece')
    }
};
