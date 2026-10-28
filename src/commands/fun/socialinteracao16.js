/**
 * Comando .ovacionar — OVACIONAR
 *
 * Gesto social: aplaudiu de pé alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'ovacionar',
    aliases: ["ovacionaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: aplaudiu de pé alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — aplaudir alguém de pé'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'ovacionar')
    }
}
