/**
 * Comando .quizmemes — QUIZ MEMES
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia33`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizmemes",
    aliases: ["memesquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de memes: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de memes; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual meme brasileiro tem um menino chorando na festa?",a:"NAZARE",opts:["Nazaré confusa","Menino do caixão","Chora não","Faustão"]},
      {q:"'Tá pegando fogo, bicho' é de quem?",a:"BOLSONARO",opts:["Datena","Bolsonaro","Faustão","Sikêra"]},
      {q:"Qual gato virou meme com a mulher apontando?",a:"GATO BRANCO",opts:["Gato branco","Gato preto","Gato laranja","Gato cinza"]},
      {q:"Qual rede social popularizou os Reels?",a:"INSTAGRAM",opts:["TikTok","Instagram","YouTube","Twitter"]},
      {q:"'Pobre, mas honesto' vem de qual programa?",a:"BBB",opts:["BBB","A Fazenda","Masterchef","No Limite"]},
      {q:"Qual meme envolve um cachorro em casa pegando fogo?",a:"THIS IS FINE",opts:["Doge","This is fine","Cheems","Bonk"]}
        ]
        return startQuiz(from, sender, reply, bank, '😹 Quiz de memes')
    }
};
