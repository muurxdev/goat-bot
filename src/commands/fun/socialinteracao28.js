/**
 * Comando .acolher — ACOLHER
 *
 * Gesto social: acolheu com hospitalidade alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'acolher',
    aliases: ["acolheralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: acolheu com hospitalidade alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — acolher alguém na taverna'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'acolher')
    }
}
