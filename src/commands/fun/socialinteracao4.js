/**
 * Comando .carregar — CARREGAR
 *
 * Gesto social: pegou no colo e carregou alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'carregar',
    aliases: ["carregaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: pegou no colo e carregou alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — pegar alguém no colo'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'carregar')
    }
}
