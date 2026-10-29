const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .bandm
 * Gerencia o bloqueio global e individual de mensagens no privado (DM) do bot
 */

const { permissionRepo } = require('../../services/permissionService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

function formatPhoneNumber(jidOrNum) {
    if (!jidOrNum) return ''
    if (typeof jidOrNum === 'string' && jidOrNum.includes('@lid')) return 'contato com número oculto'
    const digits = String(jidOrNum).replace(/\D/g, '')
    if (!digits) return String(jidOrNum)

    // Brasil (+55)
    if (digits.startsWith('55') && digits.length >= 12) {
        const ddd = digits.slice(2, 4)
        const rest = digits.slice(4)
        if (rest.length === 9) {
            return `+55 ${ddd} ${rest.slice(0, 5)}-${rest.slice(5)}`
        } else if (rest.length === 8) {
            return `+55 ${ddd} ${rest.slice(0, 4)}-${rest.slice(4)}`
        }
    }
    // Filipinas (+63)
    if (digits.startsWith('63') && digits.length >= 12) {
        return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    }
    // EUA / Canadá (+1)
    if (digits.startsWith('1') && digits.length === 11) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    return `+${digits}`
}

module.exports = {
    name: 'bandm',
    aliases: ['blockdm', 'dmblock', 'bloqueardm'],
    category: 'owner',
    subcategory: 'Privado',
    description: 'Fecha ou reabre meu privado para todos ou bloqueia uma pessoa específica',
    usage: '<on | off | list | limpar | @pessoa [motivo] | off @pessoa>',
    examples: [
        'list — mostra quem está bloqueado e se o privado está fechado',
        'on — fecha meu privado para quem não é dono',
        '@pessoa Spam no privado — bloqueia uma pessoa com motivo',
        'off @pessoa — libera a pessoa de novo'
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ sender, args = [], text = '', reply, info, quotedSender, prefix = '.' }) => {
        const fullInput = (text || args.join(' ')).trim()
        const sub = (args[0] || '').toLowerCase()
        const configs = dataService.getConfigsData()
        if (!configs['global']) configs['global'] = {}

        // 1. LISTA DE BANS (.bandm list / .bandm lista)
        if (sub === 'list' || sub === 'lista') {
            const list = permissionRepo.getAllDmBlocked()
            const isGlobalOn = !!configs['global'].blockAllDMs
            const { getOwnerRank } = require('../../services/ownerService')

            const geral = F.campo('Privado para todos', isGlobalOn
                ? '🔒 fechado (respondo com um aviso a quem não é dono)'
                : '🔓 aberto', '🌐')

            if (list.length === 0) {
                return reply(F.tela({
                    emoji: '🛡️',
                    titulo: 'Bloqueios no privado',
                    intro: 'Ninguém está bloqueado individualmente. Quando você bloquear alguém, aparece aqui com o motivo, quem bloqueou e a data.',
                    secoes: [{ emoji: '📋', titulo: 'Situação', linhas: [geral] }],
                    proximos: [
                        { nome: 'bandm', args: '@pessoa Spam no privado', oque: 'bloquear alguém' },
                        { nome: 'bandm', args: isGlobalOn ? 'off' : 'on', oque: isGlobalOn ? 'reabrir o privado para todos' : 'fechar o privado para todos' }
                    ],
                    prefix
                }))
            }

            const linhas = []
            list.forEach((item, i) => {
                const userFormatted = formatPhoneNumber(item.jid)
                const authorOwner = item.blocked_by ? getOwnerRank(item.blocked_by) : null
                let authorInfo = ''

                if (authorOwner && authorOwner.name) {
                    authorInfo = `${authorOwner.rank} ${authorOwner.name} (${authorOwner.phone || formatPhoneNumber(item.blocked_by)})`
                } else if (item.blocked_by) {
                    authorInfo = formatPhoneNumber(item.blocked_by)
                } else {
                    authorInfo = 'um dono'
                }

                const cleanReason = String(item.reason || 'Violação das regras de DM').replace(/^[@\s]+/, '').trim()

                linhas.push(`*${i + 1}. ${userFormatted}*`)
                linhas.push(`   ${F.campo('Bloqueado por', authorInfo)}`)
                linhas.push(`   ${F.campo('Motivo', cleanReason)}`)
                linhas.push(`   ${F.campo('Data', item.created_at || 'recente')}`)
            })

            return reply(F.tela({
                emoji: '🛡️',
                titulo: 'Bloqueios no privado',
                intro: `*${list.length}* pessoa(s) bloqueada(s) no meu privado.`,
                secoes: [
                    { emoji: '📋', titulo: 'Situação', linhas: [geral] },
                    { emoji: '🚫', titulo: 'Pessoas bloqueadas', linhas }
                ],
                proximos: [
                    { nome: 'bandm', args: 'off <número>', oque: 'liberar uma pessoa' },
                    { nome: 'bandm', args: 'limpar', oque: 'liberar todo mundo e reabrir o privado' }
                ],
                prefix
            }))
        }

        // 2. LIMPAR TODOS OS BANS (.bandm clear / .bandm limpar / .bandm all off)
        if (sub === 'clear' || sub === 'limpar' || (sub === 'all' && args[1]?.toLowerCase() === 'off')) {
            configs['global'].blockAllDMs = false
            await dataService.saveConfigsData(configs)
            const list = permissionRepo.getAllDmBlocked()
            list.forEach(item => permissionRepo.setDmBlocked(item.jid, false))
            logger.info(`[BANDM] ${sender} removeu todos os ${list.length} bans de DM.`)
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Privado liberado para todos',
                intro: `Tirei o bloqueio de *${list.length}* pessoa(s) e reabri meu privado.`,
                proximos: [{ nome: 'bandm', args: 'list', oque: 'conferir a situação' }],
                prefix
            }))
        }

        // 3. CONTROLE GLOBAL ON (.bandm on / .bandm global on)
        if (sub === 'on' || (sub === 'global' && args[1]?.toLowerCase() === 'on')) {
            configs['global'].blockAllDMs = true
            await dataService.saveConfigsData(configs)
            logger.info(`[BANDM GLOBAL] ${sender} ativou o bloqueio global de DM.`)
            return reply(F.tela({
                emoji: '🔒',
                titulo: 'Privado fechado para todos',
                intro: 'A partir de agora, quem me chamar no privado recebe um aviso de que o atendimento está fechado por enquanto.',
                secoes: [{ emoji: '👑', titulo: 'Exceção', linhas: ['Os donos continuam falando comigo normalmente.'] }],
                proximos: [{ nome: 'bandm', args: 'off', oque: 'reabrir o privado' }],
                prefix
            }))
        }

        // 4. DESBLOQUEIO INDIVIDUAL OU CONTROLE GLOBAL OFF
        const isUnblockKeyword = sub === 'off' || sub === 'remover' || sub === 'desbanir' || sub === 'del' || info?.body?.startsWith('.unbandm')

        if (isUnblockKeyword) {
            // Extrai o restante do texto após a palavra-chave
            const remainder = fullInput.replace(/^(off|remover|desbanir|del|unbandm)\s*/i, '').trim()
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            let targetJid = mentioned || (remainder ? null : quotedSender)

            if (!targetJid && remainder) {
                const digits = remainder.replace(/\D/g, '')
                if (digits.length >= 8) {
                    targetJid = `${digits}@s.whatsapp.net`
                }
            }

            // Se não tem alvo específico, desativa o bloqueio global de DM
            if (!targetJid) {
                configs['global'].blockAllDMs = false
                await dataService.saveConfigsData(configs)
                logger.info(`[BANDM GLOBAL] ${sender} desativou o bloqueio global de DM.`)
                return reply(F.tela({
                    emoji: '🔓',
                    titulo: 'Privado reaberto',
                    intro: 'Voltei a atender todo mundo no privado. Quem foi bloqueado individualmente continua bloqueado.',
                    proximos: [{ nome: 'bandm', args: 'list', oque: 'ver quem continua bloqueado' }],
                    prefix
                }))
            }

            // Desbloqueia o usuário específico
            permissionRepo.setDmBlocked(targetJid, false)
            logger.info(`[BANDM] ${sender} desbloqueou DM de ${targetJid}`)
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Pessoa liberada no privado',
                intro: `${nomeDoMembro(targetJid)} pode voltar a falar comigo no privado.`,
                prefix
            }), [targetJid])
        }

        // 5. BLOQUEIO INDIVIDUAL (.bandm @user [motivo] ou .bandm +55 11 99988-0200 [motivo])
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        let targetJid = mentioned || quotedSender || null
        let reason = ''

        if (!targetJid) {
            // Tenta achar dígitos de telefone no texto
            const digitsMatch = fullInput.match(/(\+?\d[\d\s\-()]{7,}\d)/)
            if (digitsMatch) {
                const cleanDigits = digitsMatch[1].replace(/\D/g, '')
                if (cleanDigits.length >= 8) {
                    targetJid = `${cleanDigits}@s.whatsapp.net`
                    reason = fullInput.replace(digitsMatch[0], '').trim()
                }
            }
        }

        if (!targetJid) {
            return reply(F.tela({
                emoji: '🛡️',
                titulo: 'Bloqueio no privado',
                intro: sub
                    ? `Não achei ninguém em "${fullInput.slice(0, 40)}". Marque a pessoa, responda a mensagem dela ou digite o número.`
                    : 'Controla quem pode falar comigo no privado: fecha para todos ou bloqueia uma pessoa só.',
                secoes: [
                    { emoji: '🌐', titulo: 'Para todos', linhas: [
                        `• ${F.cmd(prefix, 'bandm', 'on')} — fecha o privado`,
                        `• ${F.cmd(prefix, 'bandm', 'off')} — reabre o privado`
                    ] },
                    { emoji: '👤', titulo: 'Uma pessoa', linhas: [
                        `• ${F.cmd(prefix, 'bandm', '@pessoa Spam no privado')} — bloqueia com motivo`,
                        `• ${F.cmd(prefix, 'bandm', '+55 11 99988-0200')} — bloqueia pelo número`,
                        `• ${F.cmd(prefix, 'bandm', 'off @pessoa')} — libera`
                    ] }
                ],
                proximos: [{ nome: 'bandm', args: 'list', oque: 'ver quem está bloqueado' }],
                prefix
            }))
        }

        if (!reason) {
            reason = fullInput.replace(/@\d+/g, '').trim() || 'Violação das regras de mensagens privadas'
        }

        permissionRepo.setDmBlocked(targetJid, true, reason, sender)
        logger.info(`[BANDM] ${sender} bloqueou DM de ${targetJid}. Motivo: ${reason}`)

        await reply(F.tela({
            emoji: '🔒',
            titulo: 'Pessoa bloqueada no privado',
            intro: `${nomeDoMembro(targetJid)} não consegue mais usar meus comandos no privado. Se tentar, recebe o motivo e quem bloqueou.`,
            secoes: [{ emoji: '📋', titulo: 'Registro', linhas: [
                F.campo('Motivo', String(reason).replace(/^[@\s]+/, '').trim() || reason),
                F.campo('Bloqueado por', `${nomeDoMembro(sender)}`)
            ] }],
            proximos: [{ nome: 'bandm', args: `off ${targetJid.split('@')[0]}`, oque: 'liberar de novo' }],
            prefix
        }), [targetJid, sender])
    }
}
