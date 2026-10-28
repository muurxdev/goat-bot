/**
 * Comando .proteger — PROTEGER
 *
 * Gesto social: ergueu o escudo para proteger alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'proteger',
    aliases: ["protegeralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: ergueu o escudo para proteger alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — erguer o escudo por alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'proteger')
    }
}
