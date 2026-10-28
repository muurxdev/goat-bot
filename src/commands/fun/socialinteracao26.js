/**
 * Comando .defender — DEFENDER
 *
 * Gesto social: entrou na frente para defender alguém do grupo.
 */

const S = require('../../services/socialService')

module.exports = {
    name: 'defender',
    aliases: ["defenderalguem"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Gesto social: entrou na frente para defender alguém do grupo',
    usage: '@pessoa',
    examples: ['@pessoa — entrar na frente para defender alguém'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só funcionam dentro de um grupo: lá eu consigo ver quem você marcou.')
        return S.executarGesto({ reply, sender, from, mentionedJid, quotedSender, prefix }, 'defender')
    }
}
