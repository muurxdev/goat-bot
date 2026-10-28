/**
 * Comando .apresentar — APRESENTAR
 *
 * Gesto social: se apresentou formalmente a alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'apresentar',
    aliases: ["apresentaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: se apresentou formalmente a alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — se apresentar formalmente a alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'apresentar')
    }
}
