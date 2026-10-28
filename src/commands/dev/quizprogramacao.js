/**
 * Comando .quizprogramacao — Quiz de Programação
 */
module.exports = {
    name: "quizprogramacao",
    aliases: ["devquiz","quizdev","quizcodigo","cmd_quizprogramacao","alt_quizprogramacao","atalho_quizprogramacao","abrev_quizprogramacao","call_quizprogramacao","func_quizprogramacao"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Quiz de Programação",
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => { const {startQuiz}=require('../../services/quizEngine'); const bank=[
      {q:'O que significa "HTML"?',a:'HYPERTEXT MARKUP LANGUAGE',opts:['HyperText Markup Language','High Text Machine Language','Hyperlink Text Mode','Home Tool Markup']},
      {q:'Qual estrutura é LIFO?',a:'PILHA',opts:['Fila','Pilha','Árvore','Grafo']},
      {q:'Qual desses NÃO é linguagem de programação?',a:'HTTP',opts:['Python','Rust','HTTP','Go']},
      {q:'Complexidade de uma busca binária?',a:'O(LOG N)',opts:['O(n)','O(log n)','O(n²)','O(1)']},
      {q:'Comando git para baixar mudanças do remoto?',a:'PULL',opts:['push','pull','commit','merge']},
      {q:'Qual símbolo inicia comentário de linha em JS?',a:'//',opts:['#','//','--','/*']}
    ]; return startQuiz(from,sender,reply,bank,'QUIZ PROGRAMAÇÃO'); }
};
