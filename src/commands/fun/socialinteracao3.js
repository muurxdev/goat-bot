/**
 * Comando .apertar — APERTAR
 *
 * Gesto social: apertou com força alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'apertar',
    aliases: ["apertaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: apertou com força alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — dar um aperto bem forte'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'apertar')
    }
}
