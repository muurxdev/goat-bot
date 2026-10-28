/**
 * Comando .moeda2 — Cara ou coroa rápido (sem aposta)
 */
const F = require('../../utils/formato');
module.exports = {
    name: "moeda2",
    aliases: ["headsortails"],
    category: "fun",
    subcategory: "Diversão",
    description: "Cara ou coroa rápido (sem aposta)",
    examples: [' — joga uma moeda: cara ou coroa'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => { const cara=Math.random()<0.5; return reply(F.tela({ emoji: cara?'🪙':'👑', titulo: cara?'Deu cara':'Deu coroa', intro: 'Joguei a moeda para o alto e caiu *'+(cara?'cara':'coroa')+'*.', dica: 'Aqui é só para decidir na sorte, sem aposta.', proximos: [{ nome: 'moeda2', oque: 'jogar de novo' }, { nome: 'simounao', args: 'sua pergunta', oque: 'o oráculo responde sim ou não' }, { nome: 'dado', args: '2d6', oque: 'rolar dados' }], prefix })); }
};
