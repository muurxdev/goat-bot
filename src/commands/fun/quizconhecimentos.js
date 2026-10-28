/**
 * Comando .quizconhecimentos — Quiz de Conhecimentos Gerais
 */
module.exports = {
    name: "quizconhecimentos",
    aliases: ["quizgerais","quizgeral","conhecimentosgerais"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de Conhecimentos Gerais",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Quantos continentes existem?',a:'6',opts:['5','6','7','4']},
      {q:'Qual o maior oceano?',a:'PACIFICO',opts:['Atlântico','Pacífico','Índico','Ártico']},
      {q:'Quantas cores tem o arco-íris?',a:'7',opts:['5','6','7','8']},
      {q:'Qual o metal líquido à temperatura ambiente?',a:'MERCURIO',opts:['Ferro','Mercúrio','Chumbo','Alumínio']},
      {q:'Quantos lados tem um hexágono?',a:'6',opts:['5','6','7','8']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ CONHECIMENTOS GERAIS'); }
};
