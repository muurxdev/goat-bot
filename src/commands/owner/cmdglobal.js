/**
 * Comando .cmdglobal — override GLOBAL por comando (camada opt-in).
 * Só o Dono. Força um comando específico ON/OFF, vencendo o estado do módulo.
 * "auto" remove o override (o comando volta a seguir o módulo).
 */

const moduleState = require('../../services/moduleStateService')
const { resolveModuleKey, BY_KEY } = require('../../config/modules')
const { resolveGroupName } = require('../../utils/groupLabel')
const F = require('../../utils/formato')

module.exports = {
    name: 'cmdglobal',
    aliases: ['cmdon', 'cmdoff', 'comandoglobal', 'overridecmd'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga ou desliga um comando só, mesmo que a categoria dele esteja diferente',
    usage: '[on | off | auto] <comando> [global | pv | código do grupo]',
    examples: [
        ' — mostra os comandos ligados ou desligados à mão aqui',
        'off slots — desliga o .slots neste grupo',
        'on play global — liga o .play em todos os grupos e no privado',
        'auto slots — o .slots volta a seguir a categoria'
    ],
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup }) => {
        // Escopo alvo opcional (3º argumento): global | pv | <idDoGrupo>.
        // Sem ele, aplica no ambiente atual. global cobre PV + todos os grupos.
        const scopeArg = (args[2] || '').toLowerCase().trim()
        let scope = moduleState.scopeOf(from, isGroup)
        if (/^global$|^geral$/.test(scopeArg)) scope = moduleState.GLOBAL_SCOPE
        else if (/^pv$|^privado$/.test(scopeArg)) scope = moduleState.PV_SCOPE
        else if (/@g\.us$/.test(scopeArg)) scope = scopeArg
        else if (/^\d{5,}$/.test(scopeArg)) scope = `${scopeArg}@g.us`
        const sub = (args[0] || '').toLowerCase()
        const nameArg = (args[1] || '').toLowerCase().replace(/^[./!]/, '')

        const aqui = scope === moduleState.scopeOf(from, isGroup)
        const nomeGrupo = await resolveGroupName(scope, 'CMDGLOBAL')
        const ambiente = scope === moduleState.GLOBAL_SCOPE ? '🌐 todos os grupos e o privado'
            : scope === moduleState.PV_SCOPE ? '💬 o privado'
            : nomeGrupo ? `👥 *${nomeGrupo}*`
            : aqui ? '👥 este grupo' : '👥 outro grupo'

        if (!sub || sub === 'status' || sub === 'list') {
            const ov = moduleState.listCommandOverrides(scope)
            const keys = Object.keys(ov)
            return reply(F.tela({
                emoji: '🎛️',
                titulo: keys.length ? `Comandos ajustados à mão: ${keys.length}` : 'Nenhum comando ajustado à mão',
                intro: keys.length
                    ? `Em ${ambiente}, estes comandos ignoram a categoria e ficam como você deixou.`
                    : `Em ${ambiente}, todos os comandos seguem a categoria a que pertencem. Aqui apareceriam os que você ligar ou desligar um a um.`,
                secoes: [
                    keys.length ? {
                        emoji: '📋',
                        titulo: 'Ajustes',
                        linhas: keys.map(k => `${ov[k] ? '🟢 ligado' : '🔴 desligado'} — ${F.cmd(prefix, k)}`)
                    } : null,
                    {
                        emoji: '✍️',
                        titulo: 'Digite assim',
                        linhas: [
                            `• ${F.cmd(prefix, 'cmdglobal', 'off slots')} — desliga só aqui`,
                            `• ${F.cmd(prefix, 'cmdglobal', 'on play global')} — liga em todos os lugares`,
                            `• ${F.cmd(prefix, 'cmdglobal', 'auto slots')} — volta a seguir a categoria`
                        ]
                    }
                ],
                dica: 'Sem o último termo vale só onde você digitou; use pv, global ou o código de um grupo para mirar outro lugar.',
                proximos: [{ nome: 'modulo', oque: 'liga ou desliga categorias inteiras' }],
                prefix
            }))
        }

        if (!['on', 'off', 'auto'].includes(sub)) {
            return reply(F.tela({
                emoji: '❓',
                titulo: `Não entendi "${sub}"`,
                intro: 'A primeira palavra precisa ser on (liga), off (desliga) ou auto (volta a seguir a categoria).',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'cmdglobal', 'off slots')}`,
                        `• ${F.cmd(prefix, 'cmdglobal', 'auto slots')}`
                    ]
                }],
                prefix
            }))
        }
        if (!nameArg) {
            return reply(F.tela({
                emoji: '❓',
                titulo: 'Qual comando?',
                intro: `Diga o nome do comando depois de ${sub}.`,
                secoes: [{ emoji: '✍️', titulo: 'Exemplo', linhas: [`• ${F.cmd(prefix, 'cmdglobal', `${sub} slots`)}`] }],
                prefix
            }))
        }

        // valida se o comando existe
        const dispatcher = require('../../handlers/commandDispatcher')
        const cmd = dispatcher.findCommand ? dispatcher.findCommand(nameArg) : dispatcher.getCommands().get(nameArg)
        if (!cmd) {
            return reply(F.tela({
                emoji: '🔎',
                titulo: 'Comando não encontrado',
                intro: `Não conheço nenhum comando chamado ${F.cmd(prefix, nameArg)}. Confira a grafia, sem o ponto na frente.`,
                proximos: [{ nome: 'menu', oque: 'vê a lista de comandos' }],
                prefix
            }))
        }

        if (sub === 'auto') {
            moduleState.clearCommand(cmd.name, scope)
            const mk = resolveModuleKey(cmd)
            return reply(F.tela({
                emoji: '♻️',
                titulo: 'Ajuste removido',
                intro: `${F.cmd(prefix, cmd.name)} voltou a seguir a categoria *${(BY_KEY[mk]?.label) || mk}* em ${ambiente}.`,
                prefix
            }))
        }

        const enable = sub === 'on'
        moduleState.setCommand(cmd.name, enable, scope)
        return reply(F.tela({
            emoji: enable ? '🟢' : '🔴',
            titulo: enable ? 'Comando ligado' : 'Comando desligado',
            intro: `${F.cmd(prefix, cmd.name)} ficou *${enable ? 'ligado' : 'desligado'}* em ${ambiente}, independente da categoria.`,
            proximos: [{ nome: 'cmdglobal', args: `auto ${cmd.name}${scopeArg ? ' ' + scopeArg : ''}`, oque: 'desfaz o ajuste' }],
            prefix
        }))
    }
}
