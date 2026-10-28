/**
 * Comando .alimentar — ALIMENTAR
 *
 * Gesto social: dividiu a comida com alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'alimentar',
    aliases: ["alimentaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: dividiu a comida com alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — dividir a comida com alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'alimentar')
    }
}
