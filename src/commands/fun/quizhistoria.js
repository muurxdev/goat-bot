/**
 * Comando .quizhistoria — Quiz de História
 */
module.exports = {
    name: "quizhistoria",
    aliases: ["historiaquiz","quizhist"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de História",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Em que ano o Brasil foi "descoberto"?',a:'1500',opts:['1492','1500','1502','1498']},
      {q:'Quem foi o primeiro presidente do Brasil?',a:'DEODORO',opts:['Deodoro da Fonseca','Getúlio Vargas','Prudente de Morais','Floriano']},
      {q:'Qual império construiu o Coliseu?',a:'ROMANO',opts:['Grego','Romano','Egípcio','Persa']},
      {q:'Em que ano caiu o Muro de Berlim?',a:'1989',opts:['1985','1989','1991','1979']},
      {q:'Quem pintou a Mona Lisa?',a:'DA VINCI',opts:['Michelangelo','Da Vinci','Rafael','Picasso']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ HISTÓRIA'); }
};
