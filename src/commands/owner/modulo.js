/**
 * Comando .modulo — controle dos módulos POR AMBIENTE (camada opt-in "tudo OFF").
 *
 * Só o Dono. O que você liga vale SÓ para o ambiente onde o comando foi dado:
 *   - dentro de um grupo → libera só aquele grupo
 *   - no privado         → libera só o PV
 *   - com um ID no final → libera o grupo daquele ID
 *
 * Exemplos:
 *   .modulo                     → lista os módulos do ambiente atual
 *   .modulo on cassino          → liga cassino neste grupo (ou no PV)
 *   .modulo off all             → desliga tudo neste ambiente
 *   .modulo on all 12036...@g.us→ liga tudo naquele grupo específico
 */

const moduleState = require('../../services/moduleStateService')
const { MODULES, resolveModuleKey } = require('../../config/modules')
const logger = require('../../core/logger')
const F = require('../../utils/formato')
const { resolveGroupName } = require('../../utils/groupLabel')
const botProfile = require('../../services/botProfileService')
const {
    PROFILES, PROFILE_BY_KEY, resolveProfileKey, perfisComModulo,
    HIERARCHY_TREES, TODOS_MENOS_DONO
} = require('../../config/botProfiles')

/**
 * As 3 Árvores Hierárquicas Principais de Módulos (Pais e Filhos).
 */
const SECOES = [
    {
        emoji: HIERARCHY_TREES.skycode.emoji,
        titulo: 'Árvore Skycode (Pai: skycode)',
        chaves: HIERARCHY_TREES.skycode.children
    },
    {
        emoji: HIERARCHY_TREES.divulgacao.emoji,
        titulo: 'Árvore Divulgação & Moderação (Pai: divulgacao)',
        chaves: HIERARCHY_TREES.divulgacao.children
    },
    {
        emoji: HIERARCHY_TREES.liberado.emoji,
        titulo: 'Árvore Liberado (Pai: liberado)',
        chaves: HIERARCHY_TREES.liberado.children.filter(k =>
            !HIERARCHY_TREES.skycode.children.includes(k) &&
            !HIERARCHY_TREES.divulgacao.children.includes(k)
        )
    },
    {
        emoji: '👑',
        titulo: 'Só do Dono',
        chaves: ['owner']
    }
]

/** Agrupa a lista de módulos nas seções, preservando a ordem de cada uma. */
function agruparPorSecao(mods) {
    const porChave = new Map(mods.map(m => [m.key, m]))
    const grupos = []
    const vistos = new Set()

    for (const sec of SECOES) {
        const itens = sec.chaves.map(k => porChave.get(k)).filter(Boolean)
        itens.forEach(i => vistos.add(i.key))
        if (itens.length) grupos.push({ emoji: sec.emoji, titulo: sec.titulo, itens })
    }

    // Módulo novo que ainda não foi classificado não pode sumir da lista.
    const sobra = mods.filter(m => !vistos.has(m.key))
    if (sobra.length) grupos.push({ emoji: '❔', titulo: 'Sem seção', itens: sobra })

    return grupos
}

function countByModule() {
    const dispatcher = require('../../handlers/commandDispatcher')
    const counts = {}
    // O mapa pode repetir o mesmo comando; conta cada um uma vez só
    for (const cmd of new Set(dispatcher.getCommands().values())) {
        const k = resolveModuleKey(cmd)
        counts[k] = (counts[k] || 0) + 1
    }
    return counts
}

/**
 * Nome amigável do escopo. Recebendo o nome, mostra o NOME do grupo em vez do
 * JID — ler "Grupo 120363425006400341@g.us" não diz nada a quem está operando.
 * @param {string} scope
 * @param {boolean} isGroup
 * @param {string|null} [nome] Nome já resolvido do grupo (ver resolveScopeName)
 */
function scopeLabel(scope, isGroup, nome = null) {
    if (scope === moduleState.PV_SCOPE) return '💬 conversas no privado'
    if (scope === moduleState.GLOBAL_SCOPE) return '🌐 todos os lugares (privado e todos os grupos)'
    return nome ? `👥 grupo *${nome}*` : `👥 grupo de código ${scope.replace(/@g\.us$/, '')}`
}

/** Nome do grupo para exibição — helper compartilhado com os demais comandos de gestão. */
async function resolveScopeName(scope) {
    return resolveGroupName(scope, 'MODULO')
}

/** Normaliza um alvo passado pelo usuário (ID de grupo, "pv" ou vazio). */
function resolveTargetScope(arg, from, isGroup) {
    if (!arg) return moduleState.scopeOf(from, isGroup)
    const a = String(arg).trim()
    if (/^global$|^geral$|^tudo$|^todos$/i.test(a)) return moduleState.GLOBAL_SCOPE
    if (/^pv$|^privado$/i.test(a)) return moduleState.PV_SCOPE
    if (/@g\.us$/i.test(a)) return a
    if (/^\d{5,}$/.test(a)) return `${a}@g.us`   // aceita só os dígitos do ID
    return null
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`

/**
 * Lista SÓ o que está ligado no ambiente.
 *
 * A lista completa mostra todos com ligado/desligado, o que é útil para
 * configurar mas ruim para conferir. Aqui só aparece o que funciona.
 */
function renderStatus(scope, isGroup, prefix, nome = null) {
    const counts = countByModule()
    const mods = moduleState.listModules(scope)
    const ligados = mods.filter(m => m.enabled)
    const desligados = mods.filter(m => !m.enabled)
    const perfil = botProfile.getActiveProfile(scope)
    const local = [F.campo('Onde', scopeLabel(scope, isGroup, nome)), F.campo('Perfil', perfil ? `${perfil.emoji} ${perfil.label}` : 'nenhum aplicado')]

    if (!ligados.length) {
        return F.tela({
            emoji: '🔴',
            titulo: 'Nada ligado aqui',
            intro: 'Nenhuma categoria está ligada neste lugar, então não respondo a nenhum comando aqui.',
            secoes: [{ emoji: '📍', titulo: 'Local', linhas: local }],
            dica: 'O jeito mais rápido é aplicar um perfil: ele liga o uso comum e a seção escolhida de uma vez.',
            proximos: [
                { nome: 'perfilbot', args: 'rpg', oque: 'ligar o perfil RPG' },
                { nome: 'modulo', args: 'on <categoria>', oque: 'ligar só uma categoria' },
                { nome: 'modulo', oque: 'ver os perfis' }
            ],
            prefix
        })
    }

    const totalCmds = ligados.reduce((acc, m) => acc + (counts[m.key] || 0), 0)
    // Só as seções que TÊM algo ligado; seção inteira apagada vira ruído.
    const secoesLigadas = agruparPorSecao(ligados).map(g => ({
        emoji: g.emoji,
        titulo: g.titulo,
        linhas: g.itens.map(m => `• ${m.emoji} ${m.label} — ${plural(counts[m.key] || 0, 'comando', 'comandos')}`)
    }))

    return F.tela({
        emoji: '✅',
        titulo: 'O que está ligado aqui',
        intro: `*${ligados.length} de ${mods.length}* categorias ligadas, com *${plural(totalCmds, 'comando respondendo', 'comandos respondendo')}* neste lugar.`,
        secoes: [
            { emoji: '📍', titulo: 'Local', linhas: local },
            ...secoesLigadas,
            { emoji: '🔴', titulo: `Desligadas (${desligados.length})`, linhas: desligados.length ? [desligados.map(m => m.key).join(', ')] : [] }
        ],
        proximos: [
            { nome: 'modulo', args: 'categorias', oque: 'lista completa com ligado e desligado' },
            { nome: 'modulo', args: 'on <categoria>', oque: 'ligar uma categoria' },
            { nome: 'modulo', args: 'off <categoria>', oque: 'desligar uma categoria' }
        ],
        prefix
    })
}

/**
 * Lista os PERFIS, não as categorias soltas.
 *
 * Quem digita .modulo quer decidir COMO o bot atua ali, e para isso a
 * pergunta é "qual perfil?", não "quais das 19 peças?".
 */
function renderPerfis(scope, isGroup, prefix, nome = null) {
    const ativo = botProfile.getActiveProfile(scope)
    const estado = moduleState.listModules(scope)
    const ligados = new Set(estado.filter(m => m.enabled).map(m => m.key))

    const linhasPerfis = []
    for (const p of PROFILES) {
        const marca = ativo?.key === p.key ? '🟢' : '⚪'
        // Quantas categorias deste perfil já estão acesas aqui
        const acesos = p.modules.filter(k => ligados.has(k)).length
        linhasPerfis.push(`${linhasPerfis.length ? '\n' : ''}${marca} ${p.emoji} *${p.label}* — ${p.tema}`)
        linhasPerfis.push(p.description)
        linhasPerfis.push(F.campo('Categorias', `${acesos} de ${p.modules.length} ligadas aqui`))
        linhasPerfis.push(`Detalhes: ${F.cmd(prefix, 'modulo', p.key)} · aplicar: ${F.cmd(prefix, 'perfilbot', p.key)}`)
    }

    return F.tela({
        emoji: '🎭',
        titulo: 'Perfis do bot',
        intro: `*Onde:* ${scopeLabel(scope, isGroup, nome)}\n*Perfil ativo:* ${ativo ? `${ativo.emoji} ${ativo.label}` : 'nenhum'}`,
        secoes: [
            { emoji: '📋', titulo: 'Perfis disponíveis', linhas: linhasPerfis },
            { emoji: '⚙️', titulo: 'Ajustar este lugar', linhas: [
                `• ${F.cmd(prefix, 'perfilbot', '<perfil>')} — aplica um perfil inteiro`,
                `• ${F.cmd(prefix, 'modulo', 'on <categoria>')} — liga uma categoria solta`,
                `• ${F.cmd(prefix, 'modulo', 'off <categoria>')} — desliga uma categoria`
            ] },
            { emoji: '🔎', titulo: 'Conferir', linhas: [
                `• ${F.cmd(prefix, 'modulo', 'status')} — só o que está ligado aqui`,
                `• ${F.cmd(prefix, 'modulo', 'categorias')} — todas as categorias, uma a uma`
            ] }
        ],
        dica: 'O que você liga vale só para este lugar. Para mirar outro grupo, coloque o código dele no final do comando.',
        prefix
    })
}

/**
 * Detalha UM perfil: quais categorias ele acende e quais já estão ligadas aqui.
 */
function renderPerfil(chave, scope, isGroup, prefix, nome = null) {
    const p = PROFILE_BY_KEY[chave]
    if (!p) return null

    const estado = moduleState.listModules(scope)
    const porChave = new Map(estado.map(m => [m.key, m]))
    const ligados = new Set(estado.filter(m => m.enabled).map(m => m.key))
    const ativo = botProfile.getActiveProfile(scope)
    const aplicado = ativo?.key === p.key
    const acesas = p.modules.filter(k => ligados.has(k)).length

    // O que este perfil NÃO acende: explica por que um comando não responde
    // mesmo com o perfil aplicado.
    const foraDoPerfil = MODULES
        .map(m => m.key)
        .filter(k => k !== 'owner' && !p.modules.includes(k))

    return F.tela({
        emoji: p.emoji,
        titulo: `Perfil ${p.label}`,
        intro: `${aplicado ? '🟢 Este perfil está aplicado aqui.' : '⚪ Este perfil não está aplicado aqui.'} *${acesas} de ${p.modules.length}* categorias dele estão ligadas.`,
        secoes: [
            { emoji: '📋', titulo: 'Sobre', linhas: [
                F.campo('Tema', p.tema),
                F.campo('Onde', scopeLabel(scope, isGroup, nome)),
                p.description
            ] },
            { emoji: '📂', titulo: 'Categorias do perfil', linhas: p.modules.map(k => `${ligados.has(k) ? '🟢' : '🔴'} ${porChave.get(k)?.label || k}`) },
            { emoji: '🚫', titulo: 'Fora deste perfil', linhas: foraDoPerfil.length ? [foraDoPerfil.join(', ')] : [] }
        ],
        dica: aplicado ? '' : 'Aplicar o perfil liga as categorias dele e desliga as que estão de fora.',
        proximos: [
            aplicado ? null : { nome: 'perfilbot', args: p.key, oque: 'aplicar este perfil aqui' },
            { nome: 'modulo', args: 'status', oque: 'ver o que está ligado aqui' },
            { nome: 'modulo', oque: 'voltar para a lista de perfis' }
        ].filter(Boolean),
        prefix
    })
}

function render(scope, isGroup, prefix, nome = null) {
    const counts = countByModule()
    const mods = moduleState.listModules(scope)
    const secoes = agruparPorSecao(mods).map(g => ({
        emoji: g.emoji,
        titulo: `${g.titulo} — ${g.itens.filter(m => m.enabled).length}/${g.itens.length}`,
        linhas: g.itens.map(m => `${m.enabled ? '🟢' : '🔴'} ${m.emoji} *${m.key}* — ${m.label} (${counts[m.key] || 0})`)
    }))

    return F.tela({
        emoji: '🧩',
        titulo: 'Categorias de comandos',
        intro: `*Onde:* ${scopeLabel(scope, isGroup, nome)}\n*Ligadas:* ${mods.filter(m => m.enabled).length} de ${mods.length}\nVale só para este lugar. Grupo novo já entra no perfil RPG.`,
        secoes: [
            ...secoes,
            { emoji: '⚙️', titulo: 'Ligar e desligar aqui', linhas: [
                `• ${F.cmd(prefix, 'modulo', 'on <categoria>')} — liga uma categoria`,
                `• ${F.cmd(prefix, 'modulo', 'off <categoria>')} — desliga uma categoria`,
                `• ${F.cmd(prefix, 'modulo', 'on all')} — liga tudo neste lugar`,
                `• ${F.cmd(prefix, 'modulo', 'off all')} — desliga tudo neste lugar`,
                `• ${F.cmd(prefix, 'perfilbot', '<perfil>')} — liga uma seção inteira`
            ] },
            { emoji: '🎯', titulo: 'Mirar outro lugar', linhas: [
                `• ${F.cmd(prefix, 'modulo', 'on <categoria> <código do grupo>')} — outro grupo`,
                `• ${F.cmd(prefix, 'modulo', 'on all pv')} — libera o privado`,
                `• ${F.cmd(prefix, 'modulo', 'on all global')} — libera tudo em todos os lugares`
            ] },
            { emoji: '🔎', titulo: 'Conferir', linhas: [
                `• ${F.cmd(prefix, 'modulo', 'status')} — só o que está ligado`,
                `• ${F.cmd(prefix, 'cmdglobal', 'on/off <comando>')} — um comando só, em todo lugar`
            ] }
        ],
        prefix
    })
}

module.exports = {
    name: 'modulo',
    aliases: ['modulos', 'modules', 'farm', 'farms', 'ligartodos'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga/desliga módulos de comandos no ambiente atual (grupo, PV ou por ID)',
    usage: '[perfil | status | categorias | solo <categoria> | on/off <categoria> [código do grupo | pv | global]]',
    examples: [
        ' — mostra os perfis e o que está ativo aqui',
        'status — só as categorias ligadas neste lugar',
        'on all — ativa todos os módulos comuns (mantém skycode e divulgação OFF)',
        'solo rpg — ativa o ecossistema RPG e desliga os outros módulos principais',
        'on cassino — liga o cassino neste grupo',
        'off all — desliga tudo neste lugar'
    ],
    adminOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup, userRole, isOwner }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 4)
        const sub = (args[0] || '').toLowerCase()
        const currentScope = moduleState.scopeOf(from, isGroup)

        const nomeAtual = await resolveScopeName(currentScope)

        const sub2 = (args[1] || '').toLowerCase()
        const PEDE_STATUS = ['status', 'ativos', 'ligados']

        // Sem argumento ou "listar" → os PERFIS.
        if (!sub || ['list', 'lista', 'listar', 'perfis', 'perfil'].includes(sub)) {
            return reply(renderPerfis(currentScope, isGroup, prefix, nomeAtual))
        }

        // ".modulo categorias" → a listagem peça por peça.
        if (['categorias', 'categoria', 'modulos', 'tudo'].includes(sub)) {
            return reply(render(currentScope, isGroup, prefix, nomeAtual))
        }

        // ".modulo status" → o que está ativo neste ambiente.
        if (PEDE_STATUS.includes(sub) && !args[1]) {
            return reply(renderStatus(currentScope, isGroup, prefix, nomeAtual))
        }

        // ".modulo <perfil>" e ".modulo <perfil> status" → detalhe do perfil.
        const perfilPedido = resolveProfileKey(sub)
        if (perfilPedido && (!sub2 || PEDE_STATUS.includes(sub2))) {
            return reply(renderPerfil(perfilPedido, currentScope, isGroup, prefix, nomeAtual))
        }

        // ".modulo <categoria> status" → em que perfis a categoria aparece.
        if (PEDE_STATUS.includes(sub2)) {
            const chaveMod = sub
            const mod = MODULES.find(m => m.key === chaveMod)
            if (mod) {
                const ligado = moduleState.isModuleEnabled(chaveMod, currentScope)
                const perfis = perfisComModulo(chaveMod)
                return reply(F.tela({
                    emoji: ligado ? '🟢' : '🔴',
                    titulo: `${mod.label}: ${ligado ? 'ligada' : 'desligada'}`,
                    intro: `A categoria *${mod.label}* está ${ligado ? 'ligada' : 'desligada'} em ${scopeLabel(currentScope, isGroup, nomeAtual)}.`,
                    secoes: [{ emoji: '🎭', titulo: 'Aparece nos perfis', linhas: [perfis.length ? perfis.join(', ') : 'nenhum; só liga à mão'] }],
                    proximos: [
                        { nome: 'modulo', args: `${ligado ? 'off' : 'on'} ${chaveMod}`, oque: ligado ? 'desligar aqui' : 'ligar aqui' },
                        { nome: 'modulo', args: 'status', oque: 'ver tudo o que está ligado' }
                    ],
                    prefix
                }))
            }
            return reply(renderStatus(currentScope, isGroup, prefix, nomeAtual))
        }

        // ".modulo solo <categoria>" ou ".modulo unico <categoria>" → ativa a hierarquia exclusiva
        if (['solo', 'unico', 'foco', 'hierarquia'].includes(sub)) {
            const targetMod = (args[1] || '').toLowerCase()
            if (!targetMod) {
                return reply(F.tela({
                    emoji: '🎯',
                    titulo: 'Ativação Exclusiva por Hierarquia',
                    intro: 'Informe qual módulo deseja ativar de forma exclusiva. Todos os outros módulos principais ficarão OFF.',
                    secoes: [{ emoji: '✍️', titulo: 'Exemplos', linhas: [
                        `• ${F.cmd(prefix, 'modulo', 'solo rpg')} — ativa o ecossistema RPG e desliga o resto`,
                        `• ${F.cmd(prefix, 'modulo', 'solo moderacao')} — ativa ferramentas de adm e desliga o resto`,
                        `• ${F.cmd(prefix, 'modulo', 'solo downloads')} — ativa downloads e utilidades e desliga o resto`
                    ] }],
                    prefix
                }))
            }
            const scopeAlvo = resolveTargetScope(args[2], from, isGroup) || currentScope
            const nomeAlvo = scopeAlvo === currentScope ? nomeAtual : await resolveScopeName(scopeAlvo)
            const resSolo = moduleState.enableExclusiveHierarchy(targetMod, scopeAlvo)
            if (!resSolo.ok) {
                return reply(`❌ Categoria inválida: "${targetMod}". Use \`${prefix}modulo categorias\` para consultar os nomes válidos.`)
            }
            const labelMod = MODULES.find(m => m.key === targetMod)?.label || targetMod
            return reply(F.tela({
                emoji: '🎯',
                titulo: `Hierarquia Exclusiva: ${labelMod}`,
                intro: `Ativei a hierarquia de *${labelMod}* em ${scopeLabel(scopeAlvo, isGroup, nomeAlvo)}. Todos os outros módulos principais foram desligados para manter o ambiente leve e focado.`,
                secoes: [
                    { emoji: '🟢', titulo: 'Módulos Ativos Agora', linhas: resSolo.activeModules.map(k => `• ${MODULES.find(m => m.key === k)?.emoji || '⚡'} ${MODULES.find(m => m.key === k)?.label || k}`) },
                    { emoji: '🔴', titulo: 'Outros Módulos', linhas: ['Desligados neste ambiente'] }
                ],
                proximos: [
                    { nome: 'modulo', args: 'status', oque: 'conferir o que está ligado' },
                    { nome: 'modulo', args: 'on all', oque: 'ligar todos os módulos comuns' }
                ],
                prefix
            }))
        }

        // Aceita as DUAS ordens: ".modulo on rpg" e ".modulo rpg on".
        // "módulo rpg, liga" é a ordem natural em português.
        const ACOES = ['on', 'off', 'ligar', 'desligar', 'ativar', 'desativar']
        let acao = sub
        let target = (args[1] || '').toLowerCase()
        let argEscopo = args[2]

        if (!ACOES.includes(acao) && ACOES.includes(target)) {
            // Veio invertido: troca e segue normalmente.
            ;[acao, target] = [target, acao]
        }

        if (!ACOES.includes(acao)) {
            const exemplo = MODULES.some(m => m.key === sub) ? sub : 'rpg'
            return reply(F.tela({
                emoji: '❓',
                titulo: 'Não entendi o pedido',
                intro: `Não sei o que fazer com *${[sub, args[1]].filter(Boolean).join(' ')}*. Diga se é para ligar (on) ou desligar (off), e o quê.`,
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, 'modulo', `on ${exemplo}`)} — liga (também vale ${F.cmd(prefix, 'modulo', `${exemplo} on`)})`,
                    `• ${F.cmd(prefix, 'modulo', `off ${exemplo}`)} — desliga`,
                    `• ${F.cmd(prefix, 'modulo', 'on all')} — liga tudo aqui`
                ] }],
                proximos: [
                    { nome: 'perfilbot', args: 'rpg', oque: 'ligar uma seção inteira' },
                    { nome: 'modulo', args: 'status', oque: 'ver o que está ligado' },
                    { nome: 'modulo', args: 'categorias', oque: 'ver os nomes das categorias' }
                ],
                prefix
            }))
        }

        const enable = (acao === 'on' || acao === 'ligar' || acao === 'ativar')
        const verbo = enable ? 'on' : 'off'
        if (!target) {
            return reply(F.tela({
                emoji: '❓',
                titulo: `O que ${enable ? 'ligar' : 'desligar'}?`,
                intro: 'Faltou dizer qual categoria.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, 'modulo', `${verbo} cassino`)} — só o cassino`,
                    `• ${F.cmd(prefix, 'modulo', `${verbo} all`)} — tudo neste lugar`
                ] }],
                proximos: [{ nome: 'modulo', args: 'categorias', oque: 'ver os nomes das categorias' }],
                prefix
            }))
        }

        // 3º argumento (opcional) = lugar alvo (código de grupo, "pv" ou "global")
        const scope = resolveTargetScope(argEscopo, from, isGroup)
        if (!scope) {
            return reply(F.tela({
                emoji: '❓',
                titulo: 'Não reconheci o lugar',
                intro: `*${argEscopo}* não é um grupo nem um lugar que eu conheça.`,
                secoes: [{ emoji: '✍️', titulo: 'No final do comando, use', linhas: [
                    `• o código do grupo (só os números ou terminando em @g.us)`,
                    `• ${F.cmd(prefix, 'modulo', `${verbo} ${target} pv`)} — conversas no privado`,
                    `• ${F.cmd(prefix, 'modulo', `${verbo} ${target} global`)} — todos os lugares`
                ] }],
                prefix
            }))
        }

        if (scope !== currentScope && !isUserOwner) {
            return reply('🔒 Apenas os Donos do Bot podem alterar configurações de outros grupos ou globalmente. Você pode gerenciar os módulos deste grupo.')
        }

        // O alvo pode ser outro grupo (3º argumento), então resolve o nome dele.
        const nomeAlvo = scope === currentScope ? nomeAtual : await resolveScopeName(scope)

        if (target === 'all' || target === 'tudo') {
            if (enable) moduleState.enableAll(scope)
            else moduleState.disableAll(scope)
            const desligadas = moduleState.listModules(scope).filter(m => !m.enabled)
            return reply(F.tela({
                emoji: enable ? '🟢' : '🔴',
                titulo: enable ? 'Tudo ligado' : 'Tudo desligado',
                intro: enable
                    ? `Liguei todas as categorias em ${scopeLabel(scope, isGroup, nomeAlvo)}.`
                    : `Desliguei todas as categorias em ${scopeLabel(scope, isGroup, nomeAlvo)}. Não vou responder a comandos aqui até algo ser ligado de novo.`,
                secoes: enable ? [{
                    emoji: '🔒',
                    titulo: 'Continuam desligadas',
                    linhas: desligadas.map(m => `• ${m.emoji} ${m.label} (${m.key})`)
                }] : [],
                dica: enable && desligadas.some(m => m.key === 'skycode' || m.key === 'divulgacao')
                    ? `Skycode e Divulgação ficam de fora por serem específicos; ative com ${prefix}modulo on divulgacao ou ${prefix}skycode on.`
                    : '',
                proximos: [
                    { nome: 'modulo', args: `${enable ? 'off' : 'on'} all`, oque: enable ? 'desligar tudo' : 'ligar tudo' },
                    enable ? { nome: 'modulo', args: 'status', oque: 'ver o que está ligado' } : { nome: 'perfilbot', args: 'rpg', oque: 'ligar só o perfil RPG' },
                    { nome: 'modulo', args: 'categorias', oque: 'ver a lista completa' }
                ],
                prefix
            }))
        }

        const res = moduleState.setModule(target, enable, scope)
        if (!res.ok) {
            return reply(F.tela({
                emoji: '🔍',
                titulo: 'Não conheço essa categoria',
                intro: `Não existe categoria chamada *${target}*.`,
                secoes: [{ emoji: '📂', titulo: 'Categorias válidas', linhas: [MODULES.map(m => m.key).join(', ')] }],
                proximos: [
                    { nome: 'modulo', args: `${verbo} cassino`, oque: 'exemplo com uma categoria válida' },
                    { nome: 'modulo', args: 'categorias', oque: 'ver o que cada uma faz' }
                ],
                prefix
            }))
        }

        if (res.isParent) {
            const tree = HIERARCHY_TREES[res.parent] || { label: res.parent, emoji: '🌳' }
            return reply(F.tela({
                emoji: enable ? '🟢' : '🔴',
                titulo: `Árvore ${tree.label}: ${enable ? 'Ativada em Cascata' : 'Desativada'}`,
                intro: enable
                    ? `Ativei a hierarquia de *${tree.label}* em ${scopeLabel(scope, isGroup, nomeAlvo)}. Todos os ${res.children.length} submódulos e comandos específicos foram ativados simultaneamente.`
                    : `Desliguei a hierarquia de *${tree.label}* em ${scopeLabel(scope, isGroup, nomeAlvo)}. Todos os seus submódulos foram desligados.`,
                secoes: [
                    {
                        emoji: enable ? '🌳' : '🔒',
                        titulo: enable ? 'Módulos Ativados em Cascata' : 'Módulos Desativados',
                        linhas: res.children.map(k => `• ${MODULES.find(m => m.key === k)?.emoji || '⚡'} ${MODULES.find(m => m.key === k)?.label || k} (\`${k}\`)`)
                    },
                    enable ? {
                        emoji: '🛡️',
                        titulo: 'Isolamento entre Hierarquias',
                        linhas: [
                            res.parent === 'divulgacao'
                                ? 'Módulos da árvore Skycode permanecem desligados. Moderação e Anti-link ativos com banimento automático.'
                                : res.parent === 'skycode'
                                    ? 'Módulos da árvore Divulgação e Moderação permanecem desligados para manter foco em engenharia e dev.'
                                    : 'Todos os comandos proibíveis e entretenimento liberados sem travas.'
                        ]
                    } : null
                ].filter(Boolean),
                proximos: [
                    { nome: 'modulo', args: 'status', oque: 'ver o que está ligado' },
                    { nome: 'perfilbot', oque: 'ver os perfis' }
                ],
                prefix
            }))
        }

        const label = MODULES.find(m => m.key === target)?.label || target
        const ligadosAgora = moduleState.listModules(scope).filter(m => m.enabled).length
        const qtdCmds = countByModule()[target] || 0
        const poucas = enable && ligadosAgora <= 3
        return reply(F.tela({
            emoji: enable ? '🟢' : '🔴',
            titulo: `${label} ${enable ? 'ligada' : 'desligada'}`,
            intro: `${enable ? 'Liguei' : 'Desliguei'} a categoria *${label}* em ${scopeLabel(scope, isGroup, nomeAlvo)}.`,
            secoes: [{ emoji: '📊', titulo: 'Situação', linhas: [
                F.campo('Categoria', `${label} (${target})`),
                F.campo('Comandos nela', qtdCmds),
                F.campo('Ligadas agora', ligadosAgora)
            ] }],
            dica: poucas ? 'Para ligar a hierarquia inteira, use .modulo on skycode, .modulo on divulgacao ou .modulo on liberado.' : '',
            proximos: [
                { nome: 'modulo', args: `${enable ? 'off' : 'on'} ${target}`, oque: enable ? 'desfazer' : 'ligar de novo' },
                { nome: 'modulo', args: 'status', oque: 'ver só o que está ligado' },
                { nome: 'modulo', oque: 'ver os perfis' }
            ],
            prefix
        }))
    }
}
