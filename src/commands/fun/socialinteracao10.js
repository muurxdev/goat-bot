/**
 * Comando .treinarcom — TREINARCOM
 *
 * Gesto social: treinou lado a lado com alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'treinarcom',
    aliases: ["treinarcomalguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: treinou lado a lado com alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — treinar lado a lado com alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'treinarcom')
    }
}
