/**
 * Comando .quizfutebol — Quiz de Futebol
 */
module.exports = {
    name: "quizfutebol",
    aliases: ["futebolquiz","quizfut"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de Futebol",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Quantas Copas do Mundo o Brasil tem?',a:'5',opts:['4','5','6','3']},
      {q:'Qual país sediou a Copa de 2014?',a:'BRASIL',opts:['Brasil','Rússia','África do Sul','Alemanha']},
      {q:'Quantos jogadores tem um time em campo?',a:'11',opts:['10','11','12','9']},
      {q:'Quem ganhou a Copa de 2022?',a:'ARGENTINA',opts:['França','Argentina','Brasil','Croácia']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ FUTEBOL'); }
};
