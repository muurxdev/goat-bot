/**
 * Comando .cutucar — CUTUCAR
 *
 * Gesto social: cutucou alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'cutucar',
    aliases: ["cutucaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: cutucou alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — dar uma cutucada em alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'cutucar')
    }
}
