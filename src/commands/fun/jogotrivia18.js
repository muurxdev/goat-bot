/**
 * Comando .quizcarros — QUIZ CARROS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia18`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizcarros",
    aliases: ["carrosquiz","quizautomoveis"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de carros: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de carros; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"Qual marca tem o logo das 4 argolas?",a:"AUDI",opts:["BMW","Audi","Mercedes","Volkswagen"]},
      {q:"De que país é a Ferrari?",a:"ITALIA",opts:["Alemanha","Itália","França","Espanha"]},
      {q:"Qual marca fabrica o Mustang?",a:"FORD",opts:["Chevrolet","Ford","Dodge","Chrysler"]},
      {q:"Qual o carro mais vendido da história?",a:"TOYOTA COROLLA",opts:["VW Fusca","Toyota Corolla","Ford F-150","Honda Civic"]},
      {q:"O que significa 'SUV'?",a:"VEICULO UTILITARIO ESPORTIVO",opts:["Sport Utility Vehicle","Super Utility Van","Special Urban Vehicle","Sport Urban Van"]},
      {q:"Qual marca tem a estrela de três pontas?",a:"MERCEDES",opts:["BMW","Mercedes","Audi","Volvo"]}
        ]
        return startQuiz(from, sender, reply, bank, '🚗 Quiz de carros')
    }
};
