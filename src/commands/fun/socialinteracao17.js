/**
 * Comando .reverenciar — REVERENCIAR
 *
 * Gesto social: fez uma reverência a alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'reverenciar',
    aliases: ["reverenciaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: fez uma reverência a alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — fazer uma reverência a alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'reverenciar')
    }
}
