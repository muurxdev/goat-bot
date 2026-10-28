/**
 * Comando .cancel
 * Cancela um download ou processamento ativo do Media Engine
 */

const { mediaQueue } = require('../../services/mediaQueue')
const { ROLES } = require('../../services/permissionService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Mesmo número, ignorando sufixo de aparelho e domínio do jid. */
function numero(jid) {
    return String(jid || '').split('@')[0].split(':')[0]
}

module.exports = {
    name: 'cancel',
    aliases: ['cancelar', 'abort', 'abortar'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Cancela um download ou processamento de mídia em andamento',
    usage: '<código do download>',
    examples: ['ab12cd — cancela o download com esse código'],
    cooldownMs: 2000,
    execute: async ({ text, reply, sender, senderReal, isOwner, userRole, prefix = '.' }) => {
        if (!text) {
            return reply(F.tela({
                emoji: '🛑',
                titulo: 'Cancelar download',
                intro: 'Para cancelar, preciso do código do download. Ele aparece na fila.',
                secoes: [
                    { emoji: '📋', titulo: 'Como fazer', linhas: F.lista([
                        F.cmd(prefix, 'queue') + ' — veja os códigos em andamento',
                        F.cmd(prefix, 'cancel', '<código>') + ' — cancele o seu'
                    ]) }
                ],
                dica: 'Download que já terminou não pode mais ser cancelado.',
                proximos: [{ nome: 'queue', oque: 'ver a fila de downloads' }],
                prefix
            }))
        }

        // Os códigos mostrados no .queue são da mediaQueue; o mediaEngine usa
        // outros, então cancelar por ele nunca achava o download.
        const jobId = text.trim().replace(/`/g, '')
        const job = mediaQueue.getJob(jobId)

        if (job) {
            const meu = [sender, senderReal].filter(Boolean).some(j => numero(j) === numero(job.user))
            const podeTudo = Boolean(isOwner) || (userRole?.level || 0) >= ROLES.BOT_ADMIN
            if (!meu && !podeTudo) {
                logger.warn(`[MEDIA CANCEL] ${sender} tentou cancelar o job ${jobId} de ${job.user}`)
                return reply(F.tela({
                    emoji: '🔒',
                    titulo: 'Esse download não é seu',
                    intro: `O download \`${jobId}\` foi pedido por outra pessoa. Só quem pediu, ou um dono ou administrador do bot, pode cancelar.`,
                    proximos: [{ nome: 'queue', oque: 'ver a fila de downloads' }],
                    prefix
                }))
            }

            if (mediaQueue.cancel(jobId)) {
                logger.info(`[MEDIA CANCEL] Job ${jobId} de ${job.user} cancelado por ${sender}`)
                return reply(F.tela({
                    emoji: '🛑',
                    titulo: 'Download cancelado',
                    intro: `Parei o download \`${jobId}\`. Nada será enviado.`,
                    proximos: [{ nome: 'queue', oque: 'ver o resto da fila' }],
                    prefix
                }))
            }
        }

        return reply(F.tela({
            emoji: '🔍',
            titulo: 'Download não encontrado',
            intro: `Não achei nenhum download ativo com o código \`${jobId}\`. Ele pode já ter terminado.`,
            proximos: [{ nome: 'queue', oque: 'conferir os códigos em andamento' }],
            prefix
        }))
    }
}
