/**
 * Comando .salvar — SALVAR
 *
 * Gesto social: salvou de um perigo certo alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'salvar',
    aliases: ["salvaralguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: salvou de um perigo certo alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — salvar alguém de um perigo'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'salvar')
    }
}
