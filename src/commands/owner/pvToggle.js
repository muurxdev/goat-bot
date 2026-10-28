/**
 * Comando .pv — Controle do Bot no Privado (PV)
 * Exclusivo do Dono.
 * 
 * Permite ativar ou desativar o bot no PV facilmente:
 *   .pv on   → Ativa os módulos comuns no PV (menos o Skycode)
 *   .pv off  → Desativa os módulos no PV
 *   .pv status → Exibe o status atual do PV
 */

const moduleState = require('../../services/moduleStateService')
const F = require('../../utils/formato')

module.exports = {
    name: 'pv',
    aliases: ['modopv', 'privado', 'pvtogg', 'controlepv'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga, desliga ou mostra quais comandos funcionam no privado',
    usage: '[on | off | status]',
    examples: [
        ' — mostra quantas categorias estão ligadas no privado',
        'on — libera os comandos no privado',
        'off — bloqueia os comandos no privado'
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.', args }) => {
        const sub = (args[0] || '').toLowerCase()
        const pvScope = moduleState.PV_SCOPE

        if (sub === 'on' || sub === 'ativar' || sub === 'ligar' || sub === '1') {
            moduleState.enableAll(pvScope)
            return reply(F.tela({
                emoji: '💬',
                titulo: 'Comandos liberados no privado',
                intro: 'Quem falar comigo no privado já pode usar os comandos.',
                secoes: [{
                    emoji: '🔒',
                    titulo: 'Exceção',
                    linhas: ['A categoria Skycode continua sob seu controle e não foi ligada.']
                }],
                proximos: [
                    { nome: 'pv', args: 'off', oque: 'bloqueia os comandos no privado' },
                    { nome: 'modulo', args: 'on <categoria> pv', oque: 'liga uma categoria específica no privado' }
                ],
                prefix
            }))
        }

        if (sub === 'off' || sub === 'desativar' || sub === 'desligar' || sub === '0') {
            moduleState.disableAll(pvScope)
            return reply(F.tela({
                emoji: '💬',
                titulo: 'Comandos bloqueados no privado',
                intro: 'Não respondo mais a comandos no privado até você liberar de novo.',
                proximos: [
                    { nome: 'pv', args: 'on', oque: 'libera os comandos no privado' },
                    { nome: 'desativardm', oque: 'fecha o atendimento no privado por completo' }
                ],
                prefix
            }))
        }

        // Exibe status detalhado do PV
        const mods = moduleState.listModules(pvScope)
        const enabledCount = mods.filter(m => m.enabled).length
        const totalCount = mods.length

        return reply(F.tela({
            emoji: '💬',
            titulo: 'Comandos no privado',
            intro: enabledCount
                ? `${enabledCount} de ${totalCount} categorias de comandos estão ligadas no privado.`
                : 'Todas as categorias de comandos estão desligadas no privado.',
            secoes: [{
                emoji: '📊',
                titulo: 'Situação',
                linhas: [
                    F.campo('Categorias ligadas', `${enabledCount}/${totalCount}`),
                    F.barra(totalCount ? enabledCount / totalCount : 0)
                ]
            }],
            proximos: [
                { nome: 'pv', args: 'on', oque: 'libera os comandos (menos o Skycode)' },
                { nome: 'pv', args: 'off', oque: 'bloqueia todos os comandos' },
                { nome: 'modulo', args: 'on <categoria> pv', oque: 'ajusta uma categoria só' }
            ],
            prefix
        }))
    }
}
