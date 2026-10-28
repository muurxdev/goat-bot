/**
 * Comando .opendm
 * Desbane ou libera o privado do bot para usuários (aceita números formatados, menções ou 'all')
 */

const { permissionRepo } = require('../../services/permissionService')
const dataService = require('../../services/dataService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'opendm',
    aliases: ['desbanirdm', 'unbandm', 'liberardm'],
    category: 'owner',
    subcategory: 'Privado',
    description: 'Libera uma pessoa (ou todo mundo) para falar comigo no privado',
    usage: '<@pessoa | número | all>',
    examples: [
        '@pessoa — libera a pessoa marcada',
        '+55 11 99988-0200 — libera pelo número',
        'all — abre o privado e remove todos os bloqueios'
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ text = '', info, args = [], reply, sender, quotedSender, prefix = '.' }) => {
        const fullInput = (text || args.join(' ')).trim()

        const configs = dataService.getConfigsData()
        if (!configs['global']) configs['global'] = {}

        // 1. Desbanir todos / Limpar todos os bloqueios de DM
        if (args[0] === 'all' || args[0] === 'todos' || fullInput === 'all' || fullInput === 'todos' || args[0] === 'clear' || args[0] === 'limpar') {
            configs['global'].blockAllDMs = false
            await dataService.saveConfigsData(configs)
            const list = permissionRepo.getAllDmBlocked()
            list.forEach(item => permissionRepo.setDmBlocked(item.jid, false))
            logger.info(`[OPENDM] ${sender} liberou o PV globalmente e removeu todos os ${list.length} bans de DM.`)
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Privado liberado para todos',
                intro: 'Abri o privado e tirei todos os bloqueios individuais. Qualquer pessoa pode falar comigo lá agora.',
                secoes: [{
                    emoji: '📋',
                    titulo: 'O que mudou',
                    linhas: [
                        F.campo('Atendimento no privado', 'aberto'),
                        F.campo('Bloqueios removidos', list.length)
                    ]
                }],
                proximos: [{ nome: 'desativardm', oque: 'fecha o privado para todos' }],
                prefix
            }))
        }

        // 2. Extração inteligente do JID alvo (menção, quotedSender ou número com formatação)
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        let targetJid = mentioned || quotedSender || null

        if (!targetJid) {
            const digits = fullInput.replace(/\D/g, '')
            if (digits.length >= 8) {
                targetJid = `${digits}@s.whatsapp.net`
            }
        }

        if (!targetJid) {
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Liberar o privado',
                intro: 'Diga quem pode voltar a falar comigo no privado: marque, responda a mensagem da pessoa ou mande o número.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'opendm', '@pessoa')}`,
                        `• ${F.cmd(prefix, 'opendm', '+55 11 99988-0200')}`,
                        `• ${F.cmd(prefix, 'opendm', 'all')} — libera todo mundo de uma vez`
                    ]
                }],
                proximos: [{ nome: 'bandm', args: '@pessoa', oque: 'bloqueia alguém no privado' }],
                prefix
            }))
        }

        // Remove do banco relacional de forma garantida
        permissionRepo.setDmBlocked(targetJid, false)
        const userNum = targetJid.split('@')[0]

        logger.info(`[OPENDM] ${sender} desbaniu DM para ${targetJid}`)
        return reply(F.tela({
            emoji: '🔓',
            titulo: 'Privado liberado',
            intro: `@${userNum} já pode conversar e usar comandos comigo no privado.`,
            secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Liberado por', `@${sender.split('@')[0]}`)] }],
            dica: `Se o privado estiver fechado para todos, a pessoa ainda não consegue: reabra com ${F.cmd(prefix, 'ativardm')}.`,
            proximos: [{ nome: 'ativardm', oque: 'reabre o privado para todos' }],
            prefix
        }), [targetJid, sender])
    }
}
