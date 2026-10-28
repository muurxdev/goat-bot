/**
 * Comando .meusgrupos
 * Lista todos os grupos onde o usuário (ou o alvo marcado) e o bot participam juntos,
 * exibindo o Nome do Grupo, JID, Cargo do Usuário e Status do Bot.
 */

const groupAuthService = require('../../services/groupAuthService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'meusgrupos',
    aliases: ['mygroups', 'gruposmembro', 'ondeestou'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra os grupos em que você e eu estamos juntos',
    usage: '[@pessoa]',
    examples: [' — seus grupos comigo', '@pessoa — grupos de outra pessoa (só para o dono)'],
    cooldownMs: 4000,
    execute: async ({ client, reply, sender, senderReal, isOwner, info, args = [], quotedSender, prefix = '.' }) => {
        try {
            // Se for Dono e tiver marcado alguém, busca os grupos daquele usuário
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetJid = (isOwner && (mentioned || quotedSender || (args?.[0] && String(args[0]).replace(/[@+\s-]/g, '') + '@s.whatsapp.net'))) || sender

            const targetNum = targetJid.split(':')[0].split('@')[0]
            let targetReal = null
            try {
                targetReal = await groupAuthService.resolveRealJid(client, targetJid)
            } catch (errResolve) {
                logger.warn(`[MEUSGRUPOS] não resolvi o número real de ${targetJid}: ${errResolve.message}`)
            }
            const targetRealNum = targetReal ? targetReal.split(':')[0].split('@')[0] : targetNum

            const allGroups = await client.groupFetchAllParticipating()
            const groupsList = Object.values(allGroups || {})

            if (groupsList.length === 0) {
                return reply(F.tela({
                    emoji: '🏢', titulo: 'Nenhum grupo por aqui',
                    intro: 'No momento eu não estou em nenhum grupo, então não tenho o que listar.',
                    dica: 'Quando eu entrar em grupos com você, eles aparecem nesta lista.',
                    proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver como me levar para o seu grupo' }],
                    prefix
                }))
            }

            // Mesma correção do .grupos: comparar contra número E @lid do bot.
            const botJids = groupAuthService.getBotJids(client)

            // Filtra grupos onde o usuário alvo está presente
            const userGroups = []

            for (const g of groupsList) {
                const participant = g.participants?.find(p => {
                    const pNum = p.id?.split(':')[0]?.split('@')[0]
                    return pNum === targetNum || pNum === targetRealNum || groupAuthService.sameUser(p.id, targetJid) || (targetReal && groupAuthService.sameUser(p.id, targetReal))
                })

                if (participant) {
                    const isUserAdmin = participant.admin === 'admin' || participant.admin === 'superadmin'
                    const isBotAdmin = (g.participants || []).some(p => {
                        const isAdm = p.admin === 'admin' || p.admin === 'superadmin'
                        if (!isAdm) return false
                        const pj = groupAuthService.normalizeJid(p.id || p.jid || '')
                        return [...botJids].some(b => b && pj && b === pj)
                    })

                    userGroups.push({
                        id: g.id,
                        subject: g.subject || 'Grupo sem nome',
                        size: g.participants?.length || 0,
                        isUserAdmin,
                        isBotAdmin
                    })
                }
            }

            if (userGroups.length === 0) {
                const isSelf = targetJid === sender
                return reply(F.tela({
                    emoji: '🏢', titulo: 'Nenhum grupo em comum',
                    intro: isSelf
                        ? `Estou em ${groupsList.length} grupo(s), mas não encontrei você em nenhum deles.`
                        : `Estou em ${groupsList.length} grupo(s), mas não encontrei @${targetNum} em nenhum deles.`,
                    dica: 'Se você acabou de entrar num grupo, espere alguns minutos e tente de novo.',
                    proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver como me levar para o seu grupo' }],
                    prefix
                }), [targetJid])
            }

            const isSelf = targetJid === sender
            const secoes = userGroups.map((g, index) => ({
                emoji: '🏰',
                titulo: `${index + 1}. ${g.subject}`,
                linhas: [
                    F.campo('Membros', `${g.size} pessoas`),
                    F.campo(isSelf ? 'Seu cargo' : 'Cargo', g.isUserAdmin ? 'administrador' : 'membro'),
                    F.campo('Eu sou', g.isBotAdmin ? 'administrador' : 'membro'),
                    F.campo('Código do grupo', '`' + g.id + '`')
                ]
            }))
            const doc = F.tela({
                emoji: '🏢',
                titulo: `Grupos em comum: ${userGroups.length}`,
                intro: isSelf
                    ? `Você e eu estamos juntos em *${userGroups.length}* grupo(s).`
                    : `@${targetNum} está comigo em *${userGroups.length}* grupo(s).`,
                secoes,
                dica: 'Onde eu sou administrador, consigo usar todas as proteções do grupo.',
                prefix
            })

            return reply(doc.trim(), [targetJid])
        } catch (err) {
            logger.error('[MEUSGRUPOS ERROR]', err)
            return reply('😕 *Não consegui listar seus grupos agora.*\n\nTente de novo em instantes.')
        }
    }
}

