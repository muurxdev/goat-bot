/**
 * Comando .acompanhar — ACOMPANHAR
 *
 * Gesto social: seguiu viagem ao lado de alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'acompanhar',
    aliases: ["acompanharalguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: seguiu viagem ao lado de alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — seguir viagem ao lado de alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'acompanhar')
    }
}
