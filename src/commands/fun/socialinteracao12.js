/**
 * Comando .abencoar — ABENCOAR
 *
 * Gesto social: lançou uma bênção sobre alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'abencoar',
    aliases: ["abencoaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: lançou uma bênção sobre alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — lançar uma bênção sobre alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'abencoar')
    }
}
