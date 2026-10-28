/**
 * Comando .apadrinhar — APADRINHAR
 *
 * Gesto social: adotou como família alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'apadrinhar',
    aliases: ["apadrinharalguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: adotou como família alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — adotar alguém como família'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'apadrinhar')
    }
}
