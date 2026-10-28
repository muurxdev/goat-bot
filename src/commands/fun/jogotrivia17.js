/**
 * Comando .quizinternet — QUIZ INTERNET
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia17`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizinternet",
    aliases: ["internetquiz","quizweb"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de internet: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de internet; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"O que significa 'WWW'?",a:"WORLD WIDE WEB",opts:["World Wide Web","Web World Wide","Wide World Web","World Web Wide"]},
      {q:"Qual o site mais acessado do mundo?",a:"GOOGLE",opts:["Facebook","Google","YouTube","Amazon"]},
      {q:"Em que ano o Facebook foi criado?",a:"2004",opts:["2002","2004","2006","2008"]},
      {q:"O que significa 'HTTP'?",a:"PROTOCOLO DE TRANSFERENCIA DE HIPERTEXTO",opts:["HyperText Transfer Protocol","High Transfer Text Protocol","Home Text Transfer Page","Hyper Terminal Transfer"]},
      {q:"Qual empresa criou o YouTube antes do Google comprar?",a:"YOUTUBE",opts:["Google","YouTube (independente)","Yahoo","Vimeo"]},
      {q:"Qual protocolo protege sites com cadeado?",a:"HTTPS",opts:["HTTP","HTTPS","FTP","SMTP"]}
        ]
        return startQuiz(from, sender, reply, bank, '🌐 Quiz de internet')
    }
};
