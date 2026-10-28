/**
 * Comando .curarferido — CURARFERIDO
 *
 * Gesto social: curou os ferimentos de alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'curarferido',
    aliases: ["curarferidoalguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: curou os ferimentos de alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — curar os ferimentos de alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'curarferido')
    }
}
