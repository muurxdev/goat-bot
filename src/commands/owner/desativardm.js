/**
 * Comando .desativardm / .ativardm
 * Desativa (ou reativa) o atendimento no PRIVADO do bot para TODOS — sem ser um
 * ban. É uma desativação limpa e reversível, separada do sistema de ban por
 * usuário (.bandm). Ninguém é punido; o PV só fica fechado.
 */

const dataService = require('../../services/dataService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'desativardm',
    aliases: ['fechardm', 'desativarpv', 'fecharpv', 'dmoff', 'ativardm', 'dmon', 'abrirpv', 'ativarpv'],
    category: 'owner',
    subcategory: 'Privado',
    description: 'Fecha ou reabre meu atendimento no privado para todos, sem banir ninguém',
    usage: '[on]',
    examples: [
        ' — fecha o privado para todos',
        'on — reabre o privado (o mesmo que .ativardm)'
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ args, reply, sender, commandName, prefix = '.' }) => {
        const configs = dataService.getConfigsData()
        if (!configs['global']) configs['global'] = {}

        // Reativação: .ativardm / .dmon / argumento on
        const wantsOn = /^(ativardm|dmon|abrirpv|ativarpv)$/i.test(commandName || '') ||
                        ['on', 'ativar', 'abrir'].includes((args[0] || '').toLowerCase())

        configs['global'].blockAllDMs = !wantsOn
        await dataService.saveConfigsData(configs)
        logger.info(`[DM TOGGLE] PV ${wantsOn ? 'ativado' : 'desativado'} (sem ban) por ${sender}`)

        const autor = F.campo('Alterado por', `@${sender.split('@')[0]}`)
        if (wantsOn) {
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Privado aberto',
                intro: 'Voltei a atender todo mundo no privado.',
                secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [autor] }],
                dica: 'Quem foi bloqueado individualmente no privado continua bloqueado.',
                proximos: [
                    { nome: 'desativardm', oque: 'fecha o privado de novo' },
                    { nome: 'opendm', args: '@pessoa', oque: 'libera uma pessoa bloqueada no privado' }
                ],
                prefix
            }), [sender])
        }

        return reply(F.tela({
            emoji: '🔒',
            titulo: 'Privado fechado',
            intro: 'Não atendo mais ninguém no privado. Ninguém foi banido: é só o atendimento que ficou fechado.',
            secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [autor] }],
            proximos: [
                { nome: 'ativardm', oque: 'reabre o privado para todos' },
                { nome: 'bandm', args: '@pessoa', oque: 'bloqueia só uma pessoa no privado' }
            ],
            prefix
        }), [sender])
    }
}
