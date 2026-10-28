/**
 * Comando .quizciencia — Quiz de Ciências
 */
module.exports = {
    name: "quizciencia",
    aliases: ["quizscience","cienciaquiz"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de Ciências",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Qual o símbolo químico do ouro?',a:'AU',opts:['Ag','Au','Gd','Go']},
      {q:'Qual planeta é conhecido como Planeta Vermelho?',a:'MARTE',opts:['Vênus','Marte','Júpiter','Mercúrio']},
      {q:'Quantos ossos tem o corpo humano adulto?',a:'206',opts:['206','198','215','180']},
      {q:'Qual gás as plantas absorvem na fotossíntese?',a:'GAS CARBONICO',opts:['Oxigênio','Gás carbônico','Nitrogênio','Hidrogênio']},
      {q:'Quem formulou a Teoria da Relatividade?',a:'EINSTEIN',opts:['Newton','Einstein','Tesla','Bohr']},
      {q:'Qual a velocidade da luz (aprox., km/s)?',a:'300000',opts:['150000','300000','1000000','30000']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ CIÊNCIAS'); }
};
