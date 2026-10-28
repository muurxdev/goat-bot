/**
 * Comando .cantada — Uma cantada (nerd/leve) aleatória
 */
const F = require('../../utils/formato');
module.exports = {
    name: "cantada",
    aliases: ["pickup","flerte","cantadas"],
    category: "fun",
    subcategory: "Diversão",
    description: "Uma cantada (nerd/leve) aleatória",
    examples: [' — sorteia uma cantada leve'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => { const C=['Você é uma exceção não tratada: quebrou meu sistema.','Se beleza fosse bug, você seria um crash total.','Você deve ser CSS, porque deu estilo à minha vida.','Nosso amor é como Git: sempre volto pra você (checkout).','Você é O(1): acesso direto ao meu coração.','Me dá seu SSID? Quero me conectar em você.']; return reply(F.tela({ emoji: '💘', titulo: 'Cantada', intro: '_'+C[Math.floor(Math.random()*C.length)]+'_', dica: 'Use com moderação: nem todo coração aceita piada de programador.', proximos: [{ nome: 'cantada', oque: 'outra cantada' }, { nome: 'romanticometro', args: '@pessoa', oque: 'medir o romantismo de alguém' }], prefix })); }
};
