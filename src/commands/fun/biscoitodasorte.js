/**
 * Comando .biscoitodasorte — Abra um biscoito da sorte
 */
const F = require('../../utils/formato');
module.exports = {
    name: "biscoitodasorte",
    aliases: ["fortunecookie","sorte","biscoito"],
    category: "fun",
    subcategory: "Diversão",
    description: "Abra um biscoito da sorte",
    examples: [' — abre um biscoito com uma mensagem e um número da sorte'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => { const S=['Uma boa notícia chega antes do fim do dia.','Seu esforço será recompensado em breve.','Um reencontro inesperado te fará sorrir.','A resposta que procura está mais perto do que pensa.','Hoje é um bom dia para começar algo novo.']; const n=Math.floor(Math.random()*90)+1; const msg=S[Math.floor(Math.random()*S.length)]; return reply(F.tela({ emoji: '🥠', titulo: 'Biscoito da sorte', intro: 'Quebrei o biscoito e o papelzinho diz:\n_"'+msg+'"_', secoes: [{ emoji: '🔢', titulo: 'Para hoje', linhas: [F.campo('Número da sorte', '*'+n+'*')] }], dica: 'Não gostou da sorte? Tem mais biscoito no balcão.', proximos: [{ nome: 'biscoitodasorte', oque: 'abrir outro biscoito' }, { nome: 'numerodasorte', oque: 'seis números para apostas' }], prefix })); }
};
