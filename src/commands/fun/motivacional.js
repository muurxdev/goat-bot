/**
 * Comando .motivacional — Uma frase motivacional aleatória
 */
const F = require('../../utils/formato');
module.exports = {
    name: "motivacional",
    aliases: ["motivacional-cmd","cmd-motivacional"],
    category: "fun",
    subcategory: "Poesia",
    description: "Uma frase motivacional aleatória",
    examples: [' — sorteia uma frase para dar ânimo'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => { const M=['Grandes jornadas começam com um único commit.','Falhar é só um teste que ainda não passou.','Disciplina supera motivação em dias difíceis.','Você não precisa ser perfeito, precisa continuar.','Um passo por dia ainda é progresso.']; return reply(F.tela({ emoji: '🔥', titulo: 'Motivação', intro: '_"'+M[Math.floor(Math.random()*M.length)]+'"_', dica: 'Mande para quem está precisando de um empurrão hoje.', proximos: [{ nome: 'motivacional', oque: 'outra frase' }, { nome: 'frase', oque: 'frase de alguém famoso' }, { nome: 'frasealeatoria', oque: 'pensamento épico do dia' }], prefix })); }
};
