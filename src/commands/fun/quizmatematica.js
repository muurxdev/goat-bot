/**
 * Comando .quizmatematica — Quiz de Matemática
 */
module.exports = {
    name: "quizmatematica",
    aliases: ["mathquiz","quizmat"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de Matemática",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Quanto é 7 × 8?',a:'56',opts:['54','56','63','48']},
      {q:'Qual o valor de π (2 casas)?',a:'3.14',opts:['3.14','3.16','3.41','2.14']},
      {q:'Quanto é 15% de 200?',a:'30',opts:['30','25','35','20']},
      {q:'Raiz quadrada de 144?',a:'12',opts:['12','14','16','11']},
      {q:'Quanto é 2 elevado a 10?',a:'1024',opts:['512','1024','2048','256']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ MATEMÁTICA'); }
};
