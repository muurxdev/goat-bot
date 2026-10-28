/**
 * Comando .ensinar — ENSINAR
 *
 * Gesto social: ensinou um segredo a alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'ensinar',
    aliases: ["ensinaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: ensinou um segredo a alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — ensinar um segredo a alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'ensinar')
    }
}
