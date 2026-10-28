/**
 * Comando .reflexao — Uma reflexão do dia
 */
const F = require('../../utils/formato');
module.exports = {
    name: "reflexao",
    aliases: ["pensamento","reflexoes"],
    category: "fun",
    subcategory: "Poesia",
    description: "Uma reflexão do dia",
    examples: [' — sorteia uma reflexão para pensar'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => { const R=['Nem tudo que conta pode ser contado.','O tempo que você gosta de perder não é tempo perdido.','Comparar-se é roubar a própria alegria.','O silêncio também é uma resposta.','A pressa é inimiga da profundidade.']; return reply(F.tela({ emoji: '🌌', titulo: 'Reflexão do dia', intro: '_'+R[Math.floor(Math.random()*R.length)]+'_', dica: 'Pense nela com calma antes de pedir a próxima.', proximos: [{ nome: 'reflexao', oque: 'outra reflexão' }, { nome: 'haiku', oque: 'um poema curto' }], prefix })); }
};
