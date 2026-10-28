const logger = require('../../core/logger')
const F = require('../../utils/formato')
const groupAuthService = require('../../services/groupAuthService')

module.exports = {
    name: 'clear',
    aliases: ["apagar","delete","del","cmd_clear","alt_clear","atalho_clear","abrev_clear","call_clear","func_clear"],
    category: 'admin',
    description: 'Apaga a mensagem que você responder',
    examples: [' — respondendo a uma mensagem, apaga ela do grupo'],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ info, from, client, reply, prefix = '.' }) => {
        const contexto = info.message?.extendedTextMessage?.contextInfo
        const quotedKey = contexto?.stanzaId
        const quotedParticipant = contexto?.participant

        if (!quotedKey) {
            return reply(F.tela({
                emoji: '🗑️', titulo: 'Apagar mensagem', prefix,
                intro: 'Responda à mensagem que você quer apagar e escreva o comando na resposta.',
                secoes: [{ emoji: '✍️', titulo: 'Como fazer', linhas: [
                    '1. Segure a mensagem e toque em Responder',
                    '2. Escreva ' + F.cmd(prefix, 'clear') + ' e envie'
                ] }],
                dica: 'Consigo apagar mensagens de qualquer membro porque sou administrador do grupo.',
                proximos: [{ nome: 'limparbot', oque: 'apaga as minhas últimas mensagens' }]
            }))
        }

        try {
            await client.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    // Mensagem minha precisa ir como fromMe, senão o WhatsApp ignora.
                    fromMe: quotedParticipant ? groupAuthService.isBotJid(quotedParticipant, client) : false,
                    id: quotedKey,
                    participant: quotedParticipant
                }
            })
        } catch (err) {
            logger.warn(`[CLEAR] Falha ao apagar mensagem ${quotedKey} em ${from}: ${err.message}`)
            return reply('❌ Não consegui apagar essa mensagem. Ela pode ser antiga demais ou já ter sido apagada. Tente de novo em instantes.')
        }
    }
}
