/**
 * Comando .link / .linkgrupo / .convite
 * Mostra o link oficial de convite do grupo.
 *
 * `adminOnly` foi acrescentado na auditoria de 2026-09-17: o comando não
 * declarava permissão nenhuma e a única checagem era `if (!isBotAdmin)`, que
 * pergunta se O BOT é admin, não quem pediu. Resultado: qualquer membro pegava
 * o link usando o privilégio do bot, mesmo em grupo onde o WhatsApp reserva o
 * convite aos administradores.
 *
 * Não leva `botAdminOnly` de propósito: isso barraria o ramo do privado, onde
 * quem manda é dono do bot e não existe "admin do grupo".
 */

const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'link',
    aliases: ["linkgrupo","convite","grouplink","groupinvite","cmd_link","alt_link","atalho_link","abrev_link","call_link","func_link"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Mostra o link de convite do grupo (só admins)',
    examples: [' — mostra o link de convite deste grupo'],
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, isGroup, client, isOwner, isBotAdmin, reply, args, prefix = '.' }) => {
        // 1. Dentro do grupo
        if (isGroup) {
            try {
                const groupMetadata = await client.groupMetadata(from)

                if (!isBotAdmin) {
                    return reply('🛡️ Preciso ser administrador deste grupo para pegar o link de convite. Me promova nas informações do grupo e tente de novo.')
                }

                const code = await client.groupInviteCode(from)
                if (typeof code !== "string" || !code) throw new Error("o WhatsApp não devolveu o código do convite")

                if (typeof code !== "string" || !code) throw new Error("o WhatsApp não devolveu o código do convite")

                return reply(F.tela({
                    emoji: '🔗',
                    titulo: 'Link de convite',
                    intro: [
                        F.campo('Grupo', groupMetadata.subject),
                        F.campo('Gente aqui dentro', groupMetadata.participants?.length || 0)
                    ].join('\n'),
                    secoes: [`https://chat.whatsapp.com/${code}`],
                    dica: 'Mande esse link só para quem você quer mesmo aqui dentro. Quem tiver o link entra sem pedir licença.',
                    proximos: [
                        { nome: 'resetlink', oque: 'trocar o link, se ele vazar' },
                        { nome: 'regras', oque: 'ver as regras do grupo' }
                    ],
                    prefix
                }))
            } catch (err) {
                logger.error('[LINK COMMAND ERROR]', err)
                return reply('❌ Não consegui pegar o link de convite agora. Tente de novo em instantes.')
            }
        }

        // 2. No privado, só para os donos do bot
        if (!isGroup && isOwner) {
            try {
                const query = (args[0] || '').trim().toLowerCase()
                const chats = await client.groupFetchAllParticipating()
                const groupList = Object.values(chats)

                if (!query) {
                    return reply(F.tela({
                        emoji: '🌐',
                        titulo: 'Grupos onde eu estou',
                        intro: F.campo('Total', groupList.length),
                        secoes: [{
                            emoji: '📋',
                            titulo: `Primeiros ${Math.min(15, groupList.length)}`,
                            linhas: groupList.slice(0, 15).map((g, i) =>
                                `${i + 1}. *${g.subject}* — ${g.participants?.length || 0} membros\n   \`${g.id}\``)
                        }],
                        dica: 'Peça o link de um deles pelo nome ou pelo código.',
                        proximos: [{ nome: 'link', args: '<nome do grupo>', oque: 'o link daquele grupo' }],
                        prefix
                    }))
                }

                const targetGroup = groupList.find(g => g.id === query || g.subject.toLowerCase().includes(query))
                if (!targetGroup) {
                    return reply(`🔍 Não achei nenhum grupo com "${query}".`)
                }

                try {
                    const code = await client.groupInviteCode(targetGroup.id)
                    if (typeof code !== "string" || !code) throw new Error("o WhatsApp não devolveu o código do convite")
                    return reply(F.tela({
                        emoji: '🔗',
                        titulo: 'Link de convite',
                        intro: [
                            F.campo('Grupo', targetGroup.subject),
                            F.campo('Gente lá dentro', targetGroup.participants?.length || 0)
                        ].join('\n'),
                        secoes: [`https://chat.whatsapp.com/${code}`],
                        prefix
                    }))
                } catch (codeErr) {
                    logger.warn(`[LINK] Sem link de "${targetGroup.subject}": ${codeErr.message}`)
                    return reply(`⚠️ Não consegui o link de *${targetGroup.subject}* porque não sou administrador lá.`)
                }
            } catch (dmErr) {
                logger.error('[LINK DM ERROR]', dmErr)
                return reply('❌ Não consegui ver os grupos onde estou agora. Tente de novo em instantes.')
            }
        }

        return reply('👥 Esse comando funciona dentro de um grupo.')
    }
}
