const { getBotName } = require('../../config/botConfig');
module.exports = {
    name: 'akinator',
    aliases: ['genioakinator', 'adivinharapositivo', 'aki'],
    category: 'fun',
    description: 'Inicia o jogo do Akinator para adivinhar em quem você está pensando',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = '╔══════════════════════════════╗\n';
        doc += '║       🧞 *AKINATOR* 🧞       ║\n';
        doc += '╚══════════════════════════════╝\n\n';
        doc += '🔮 *Pense em um personagem real ou fictício!*\n';
        doc += '1. O seu personagem é brasileiro?\n';
        doc += '2. O seu personagem é de anime?\n\n';
        doc += '👑 *' + botName + '*';
        return reply(doc.trim());
    }
};