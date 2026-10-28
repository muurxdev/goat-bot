/**
 * Comando .quizsiglas — QUIZ SIGLAS
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 *
 * Substitui o antigo esboço `jogotrivia23`, que só imprimia um texto
 * descrevendo a si mesmo. Agora é um quiz de verdade: usa o quizEngine, aceita
 * resposta livre no chat e premia com XP e Coins.
 */

module.exports = {
    name: "quizsiglas",
    aliases: ["siglasquiz"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz de siglas: responda no chat e ganhe XP e moedas",
    examples: [" — sorteia uma pergunta de siglas; responda no chat com o número ou o texto"],
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const { startQuiz } = require('../../services/quizEngine')
        const bank = [
      {q:"O que significa 'ONU'?",a:"ORGANIZACAO DAS NACOES UNIDAS",opts:["Organização das Nações Unidas","Ordem Nacional Unida","Órgão Nacional Único","Organização Nova Unida"]},
      {q:"O que significa 'CPF'?",a:"CADASTRO DE PESSOAS FISICAS",opts:["Cadastro de Pessoas Físicas","Controle Público Federal","Cadastro Público Fiscal","Certidão Pessoal Federal"]},
      {q:"O que significa 'SUS'?",a:"SISTEMA UNICO DE SAUDE",opts:["Sistema Único de Saúde","Serviço Unificado de Saúde","Sistema Universal de Saúde","Saúde Única Social"]},
      {q:"O que significa 'PIB'?",a:"PRODUTO INTERNO BRUTO",opts:["Produto Interno Bruto","Principal Índice Brasileiro","Programa de Investimento Básico","Produção Industrial Bruta"]},
      {q:"O que significa 'FGTS'?",a:"FUNDO DE GARANTIA",opts:["Fundo de Garantia do Tempo de Serviço","Fundo Geral do Trabalhador","Fundo de Gestão Trabalhista","Fundo Garantido Social"]},
      {q:"O que significa 'OMS'?",a:"ORGANIZACAO MUNDIAL DA SAUDE",opts:["Organização Mundial da Saúde","Órgão Médico Superior","Organização Médica Social","Ordem Mundial Sanitária"]}
        ]
        return startQuiz(from, sender, reply, bank, '🔠 Quiz de siglas')
    }
};
