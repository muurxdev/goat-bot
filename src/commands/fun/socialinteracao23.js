/**
 * Comando .consolar — CONSOLAR
 *
 * Gesto social: consolou nos braços alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'consolar',
    aliases: ["consolaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: consolou nos braços alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — consolar alguém nos braços'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'consolar')
    }
}
