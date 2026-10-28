/**
 * Comando .quizlogica — Quiz de Lógica e raciocínio
 */
module.exports = {
    name: "quizlogica",
    aliases: ["logicaquiz","quizraciocinio"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de Lógica e raciocínio",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Complete: 2, 4, 8, 16, ...?',a:'32',opts:['24','32','30','20']},
      {q:'Se todo A é B, e todo B é C, então todo A é...?',a:'C',opts:['A','B','C','nenhum']},
      {q:'Qual número não pertence: 3, 5, 7, 9, 11?',a:'9',opts:['5','7','9','11']},
      {q:'Complete: 1, 1, 2, 3, 5, 8, ...?',a:'13',opts:['11','12','13','15']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ LÓGICA'); }
};
