/**
 * Votação democrática de moderação (.votekick / .voteban).
 *
 * Fluxo: anuncia a votação, coleta "SIM"/"NAO" das mensagens comuns do grupo
 * (via interactionService, que já é consultado para toda mensagem sem prefixo),
 * e ao fim do prazo apura e executa a ação se aprovada.
 *
 * Regras: 1 voto por pessoa (o último vale), o alvo não vota, exige um mínimo de
 * votos para valer, e maioria simples entre SIM e NAO.
 */

const interactionService = require('./interactionService')
const logger = require('../core/logger')

// Uma votação por grupo de cada vez.
const emAndamento = new Map()

function _contar(votos) {
    let sim = 0, nao = 0
    for (const v of votos.values()) { if (v === 'sim') sim++; else if (v === 'nao') nao++ }
    return { sim, nao, total: sim + nao }
}

/**
 * @param {object} o
 * @param {string} o.acao 'kick' (remover do grupo) | 'ban' (remover + banir do bot)
 * @returns {Promise<void>}
 */
async function iniciarVotacao({ client, from, reply, alvo, acao = 'kick', iniciador, isBotAdmin, duracaoMs = 60000, minVotos = 3 }) {
    if (emAndamento.has(from)) {
        return reply('⚠️ Já tem uma votação aberta neste grupo. Espere ela terminar.')
    }
    if (interactionService.has(from)) {
        return reply('⚠️ Tem um jogo ou outra atividade em andamento no grupo. Espere terminar para abrir a votação.')
    }

    // Não abre votação que já nasce perdida: criador do grupo, o próprio bot ou
    // quem nem está no grupo. Admin comum pode ser votado.
    const groupRemovalService = require('./groupRemovalService')
    try {
        const pre = await groupRemovalService.avaliarAlvo(client, from, alvo, { autor: iniciador })
        const bloqueantes = [groupRemovalService.MOTIVOS.CRIADOR, groupRemovalService.MOTIVOS.E_O_BOT,
            groupRemovalService.MOTIVOS.NAO_ESTA, groupRemovalService.MOTIVOS.PROPRIO]
        if (!pre.ok && bloqueantes.includes(pre.motivo)) {
            return reply(groupRemovalService.mensagemFalha(pre.motivo, pre.apiJid || alvo), [pre.apiJid || alvo])
        }
    } catch (err) {
        logger.warn(`[VOTACAO] Não consegui checar o alvo ${alvo} em ${from} antes de abrir: ${err.message}`)
    }

    const ehBan = acao === 'ban'
    const alvoNum = alvo.split('@')[0]
    const votos = new Map()
    emAndamento.set(from, true)

    await client.sendMessage(from, {
        text: `🗳️ *Votação aberta*\n\n` +
            `@${iniciador.split('@')[0]} propôs remover @${alvoNum} do grupo${ehBan ? ' e impedir o uso dos meus comandos' : ''}.\n\n` +
            `• Responda *SIM* para aprovar\n` +
            `• Responda *NAO* para rejeitar\n\n` +
            `*Prazo:* ${Math.round(duracaoMs / 1000)} segundos\n` +
            `Precisa de pelo menos ${minVotos} votos; vence a maioria.`,
        mentions: [alvo, iniciador]
    })

    interactionService.register(from, {
        type: 'votacao',
        ttlMs: duracaoMs + 10000,
        onText: async (texto, ctx) => {
            const t = String(texto || '').trim().toLowerCase()
            const votante = ctx && ctx.userJid
            if (!votante || votante === alvo) return false
            let v = null
            if (/^(sim|s|yes|y|👍)$/.test(t)) v = 'sim'
            else if (/^(nao|não|n|no|👎)$/.test(t)) v = 'nao'
            if (!v) return false
            votos.set(votante, v)
            // false = não consome a mensagem; ela segue o fluxo normal do grupo.
            return false
        }
    })

    setTimeout(async () => {
        try {
            interactionService.clear(from)
            emAndamento.delete(from)

            const { sim, nao, total } = _contar(votos)

            if (total < minVotos) {
                return client.sendMessage(from, {
                    text: `🗳️ A votação sobre @${alvoNum} terminou sem votos suficientes (${sim} sim, ${nao} não; mínimo de ${minVotos}). Nada mudou.`,
                    mentions: [alvo]
                })
            }

            if (sim <= nao) {
                return client.sendMessage(from, {
                    text: `🗳️ A votação sobre @${alvoNum} foi rejeitada (${sim} sim, ${nao} não). A pessoa continua no grupo.`,
                    mentions: [alvo]
                })
            }

            // Aprovada. Admin do bot é conferido agora, não no início: pode ter
            // mudado durante a votação.
            const groupRemovalService = require('./groupRemovalService')
            const resultado = await groupRemovalService.removerMembro(client, from, alvo, { origem: 'votacao' })
            if (!resultado.ok) {
                return client.sendMessage(from, {
                    text: `🗳️ A votação sobre @${alvoNum} foi aprovada (${sim} sim, ${nao} não).\n\n${groupRemovalService.mensagemFalha(resultado.motivo, alvo)}`,
                    mentions: [alvo]
                })
            }

            let extra = ''
            if (ehBan) {
                try {
                    const { banUser } = require('./securityService')
                    banUser(alvo, `Votação do grupo aprovou o banimento (${sim} x ${nao})`, 'votacao-do-grupo')
                    extra = ' Também não pode mais usar meus comandos.'
                } catch (e) {
                    logger.warn(`[VOTACAO] Falha ao banir ${alvo}: ${e.message}`)
                }
            }

            logger.info(`[VOTACAO] ${acao} aprovado em ${from} para ${alvo} (${sim}x${nao})`)
            return client.sendMessage(from, {
                text: `🗳️ A votação foi aprovada (${sim} sim, ${nao} não) e @${alvoNum} foi removido do grupo.${extra}`,
                mentions: [alvo]
            })
        } catch (err) {
            logger.error('[VOTACAO ERROR]', err)
        }
    }, duracaoMs)
}

module.exports = { iniciarVotacao }
