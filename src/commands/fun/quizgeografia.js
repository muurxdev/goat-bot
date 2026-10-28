/**
 * Comando .quizgeografia — Quiz de Geografia
 */
module.exports = {
    name: "quizgeografia",
    aliases: ["quizgeo","geografiaquiz"],
    category: "fun",
    subcategory: "Quiz",
    description: "Quiz de Geografia",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'Qual o maior país do mundo em área?',a:'RUSSIA',opts:['China','Rússia','Canadá','EUA']},
      {q:'Qual a capital da Austrália?',a:'CANBERRA',opts:['Sydney','Melbourne','Canberra','Perth']},
      {q:'Qual o rio mais extenso do mundo?',a:'AMAZONAS',opts:['Nilo','Amazonas','Yangtzé','Mississippi']},
      {q:'Em que continente fica o Egito?',a:'AFRICA',opts:['Ásia','África','Europa','Oceania']},
      {q:'Qual país tem mais habitantes?',a:'INDIA',opts:['China','Índia','EUA','Brasil']},
      {q:'Qual o menor país do mundo?',a:'VATICANO',opts:['Mônaco','Vaticano','Nauru','Malta']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ GEOGRAFIA'); }
};
