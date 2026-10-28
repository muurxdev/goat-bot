/**
 * Comando .animar — ANIMAR
 *
 * Gesto social: levantou o ânimo de alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'animar',
    aliases: ["animaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: levantou o ânimo de alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — levantar o ânimo de alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'animar')
    }
}
