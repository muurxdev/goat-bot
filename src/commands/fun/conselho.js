/**
 * Comando .conselho — Um conselho aleatório
 */
const F = require('../../utils/formato');
module.exports = {
    name: "conselho",
    aliases: ["advice","dica"],
    category: "fun",
    subcategory: "Diversão",
    description: "Um conselho aleatório",
    examples: [' — sorteia um conselho para o dia'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => { const C=['Faça hoje o que seu eu de amanhã vai agradecer.','Commite pequeno e commite sempre.','Se está difícil decidir, durma e decida amanhã.','Beba água antes de mais um café.','Aprenda a dizer não sem se justificar demais.','Documente enquanto a memória está fresca.','Não compare seu capítulo 1 com o capítulo 20 dos outros.','Teste em produção é fé, não engenharia.']; return reply(F.tela({ emoji: '🧭', titulo: 'Conselho', intro: '_'+C[Math.floor(Math.random()*C.length)]+'_', dica: 'Um conselho por vez: guarde este antes de pedir outro.', proximos: [{ nome: 'conselho', oque: 'outro conselho' }, { nome: 'conselhous', oque: 'um conselho da taverna' }, { nome: 'reflexao', oque: 'uma reflexão do dia' }], prefix })); }
};
