/**
 * Comando .elogio — Um elogio sincero aleatório
 */
const F = require('../../utils/formato');
module.exports = {
    name: "elogio",
    aliases: ["compliment","elogios"],
    category: "fun",
    subcategory: "Interação",
    description: "Um elogio sincero aleatório",
    usage: '[@pessoa]',
    examples: [' — recebe um elogio', '@pessoa — elogia alguém do grupo'],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = '.' }) => { const E=['Sua persistência inspira quem está por perto.','Você tem um jeito único de resolver problemas.','O grupo fica melhor quando você aparece.','Sua curiosidade é um superpoder.','Você aprende rápido e ajuda os outros — raro.']; const quem=(mentionedJid&&mentionedJid[0])||sender; const nome=quem?('@'+String(quem).split('@')[0]):'você'; const proprio=quem===sender; return reply(F.tela({ emoji: '🌟', titulo: 'Elogio sincero', intro: nome+', '+E[Math.floor(Math.random()*E.length)].replace(/^./, c=>c.toLowerCase()), dica: proprio ? 'Marque alguém para mandar o elogio para outra pessoa.' : 'Elogio de graça faz o dia de alguém. Mande outro!', proximos: [{ nome: 'elogio', args: '@pessoa', oque: 'elogiar alguém do grupo' }, { nome: 'animar', args: '@pessoa', oque: 'levantar o ânimo de alguém' }], prefix }), quem?[quem]:[]); }
};
