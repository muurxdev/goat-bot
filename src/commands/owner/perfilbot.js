/**
 * Ativa/desativa PERFIS de atuação do bot.
 *
 *   .perfilbot                  → lista os perfis e mostra o ativo aqui
 *   .perfilbot rpg              → ativa o perfil RPG neste ambiente
 *   .perfilbot goat pv         → ativa no privado
 *   .perfilbot skycode 12036...@g.us → ativa em outro grupo
 *   .perfilbot off              → desativa (desliga todos os módulos daqui)
 *
 * Separado do .modulo de propósito: .modulo é o ajuste fino, peça por peça;
 * aqui se escolhe COMO o bot atua, e o preset resolve os módulos.
 */

const moduleState = require('../../services/moduleStateService')
const botProfile = require('../../services/botProfileService')
const { resolveProfileKey } = require('../../config/botProfiles')
const { BY_KEY } = require('../../config/modules')
const { resolveGroupName } = require('../../utils/groupLabel')
const F = require('../../utils/formato')

/** Rótulo do ambiente, preferindo o NOME do grupo ao código. */
function scopeLabel(scope, nome = null, aqui = false) {
    if (scope === moduleState.PV_SCOPE) return '💬 privado'
    if (scope === moduleState.GLOBAL_SCOPE) return '🌐 global'
    if (nome) return `👥 grupo *${nome}*`
    return aqui ? '👥 este grupo' : '👥 outro grupo'
}

/** Normaliza o ambiente alvo (ID de grupo, "pv", "global" ou vazio = aqui). */
function resolveTargetScope(arg, from, isGroup) {
    if (!arg) return moduleState.scopeOf(from, isGroup)
    const a = String(arg).trim()
    if (/^global$|^geral$/i.test(a)) return moduleState.GLOBAL_SCOPE
    if (/^pv$|^privado$/i.test(a)) return moduleState.PV_SCOPE
    if (/@g\.us$/i.test(a)) return a
    if (/^\d{5,}$/.test(a)) return `${a}@g.us`
    return null
}

function render(scope, prefix, nome = null, aviso = null) {
    const perfis = botProfile.listProfiles(scope)
    const ativo = perfis.find(p => p.active)

    const linhasPerfis = []
    for (const p of perfis) {
        linhasPerfis.push(`${p.active ? '🟢' : '⚪'} ${p.emoji} *${p.label}* (${p.key}) — ${p.modules.length} categorias`)
        linhasPerfis.push(`   _${p.description}_`)
    }

    return F.tela({
        emoji: '🎭',
        titulo: aviso ? aviso : (ativo ? `Perfil ativo: ${ativo.label}` : 'Nenhum perfil ativo'),
        intro: aviso
            ? 'Escolha um dos perfis abaixo pelo nome entre parênteses.'
            : 'O perfil decide quais categorias de comandos respondem aqui; o jeito de responder é o mesmo em todos.',
        secoes: [
            {
                emoji: '📍',
                titulo: 'Ambiente',
                linhas: [
                    F.campo('Onde', scopeLabel(scope, nome, true)),
                    F.campo('Perfil ativo', ativo ? `${ativo.emoji} ${ativo.label}` : 'nenhum (tudo desligado)')
                ]
            },
            { emoji: '🎭', titulo: 'Perfis', linhas: linhasPerfis },
            ativo ? {
                emoji: '📦',
                titulo: 'Categorias ligadas agora',
                linhas: [ativo.modules.map(k => BY_KEY[k] ? BY_KEY[k].label : k).join(', ')]
            } : null
        ],
        proximos: [
            { nome: 'perfilbot', args: '<perfil>', oque: 'ativa aqui' },
            { nome: 'perfilbot', args: '<perfil> pv', oque: 'ativa no privado' },
            { nome: 'perfilbot', args: 'off', oque: 'desliga tudo aqui' },
            { nome: 'modulo', oque: 'ajuste fino, categoria por categoria' }
        ],
        prefix
    })
}

module.exports = {
    name: 'perfilbot',
    aliases: ['modobot', 'perfis', 'botperfil', 'modoatuacao'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Escolhe como eu atuo aqui: RPG, Skycode, completo e outros perfis',
    usage: '[perfil | off] [pv | global | código do grupo]',
    examples: [
        ' — mostra os perfis e qual está ativo aqui',
        'rpg — ativa o perfil de RPG neste grupo',
        'rpg pv — ativa o perfil de RPG no privado',
        'off — desliga tudo neste grupo'
    ],
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup }) => {
        const sub = (args[0] || '').toLowerCase().trim()
        const scopeAtual = moduleState.scopeOf(from, isGroup)

        if (!sub || ['status', 'list', 'lista', 'ver'].includes(sub)) {
            const nome = await resolveGroupName(scopeAtual, 'PERFILBOT')
            return reply(render(scopeAtual, prefix, nome))
        }

        const desligar = ['off', 'desativar', 'desligar', 'nenhum'].includes(sub)
        const scope = resolveTargetScope(args[1], from, isGroup)
        if (!scope) {
            return reply(F.tela({
                emoji: '❓',
                titulo: `Não sei onde fica "${args[1]}"`,
                intro: 'Depois do perfil, diga onde aplicar: pv (privado), global ou o código de um grupo. Sem nada, vale aqui.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'perfilbot', `${sub} pv`)}`,
                        `• ${F.cmd(prefix, 'perfilbot', sub)}`
                    ]
                }],
                prefix
            }))
        }
        const aqui = scope === scopeAtual
        const nome = await resolveGroupName(scope, 'PERFILBOT')

        if (desligar) {
            const res = botProfile.clearProfile(scope)
            const antes = res.anterior ? `${res.anterior.emoji} ${res.anterior.label}` : 'nenhum'
            return reply(F.tela({
                emoji: '🔴',
                titulo: 'Perfil desativado',
                intro: `Desliguei todas as categorias de comandos em ${scopeLabel(scope, nome, aqui)}.`,
                secoes: [{
                    emoji: '📋',
                    titulo: 'Detalhes',
                    linhas: [
                        F.campo('Onde', scopeLabel(scope, nome, aqui)),
                        F.campo('Perfil anterior', antes)
                    ]
                }],
                proximos: [{ nome: 'perfilbot', args: '<perfil>', oque: 'reativa com um perfil' }],
                prefix
            }))
        }

        const key = resolveProfileKey(sub)
        if (!key) {
            return reply(render(scopeAtual, prefix, await resolveGroupName(scopeAtual, 'PERFILBOT'), `Não conheço o perfil "${sub}"`))
        }

        const res = botProfile.applyProfile(key, scope)
        if (!res.ok) {
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não ativei o perfil',
                intro: res.reason,
                proximos: [{ nome: 'perfilbot', oque: 'vê os perfis disponíveis' }],
                prefix
            }))
        }

        const p = res.perfil
        const nomes = res.ligados.map(k => BY_KEY[k] ? BY_KEY[k].label : k)
        return reply(F.tela({
            emoji: '🟢',
            titulo: `Perfil ${p.label} ativado`,
            intro: p.description,
            secoes: [
                {
                    emoji: '📋',
                    titulo: 'Detalhes',
                    linhas: [
                        F.campo('Perfil', `${p.emoji} ${p.label}`),
                        F.campo('Onde', scopeLabel(scope, nome, aqui))
                    ]
                },
                { emoji: '📦', titulo: `Categorias ligadas (${res.ligados.length})`, linhas: [nomes.join(', ')] }
            ],
            proximos: [{ nome: 'modulo', args: 'on|off <categoria>', oque: 'ajuste fino, categoria por categoria' }],
            prefix
        }))
    }
}
