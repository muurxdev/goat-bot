/**
 * Comando .auto — conteúdo automático do grupo.
 *
 *   .auto                  → estado deste grupo
 *   .auto on               → liga (tema deduzido do nome do grupo)
 *   .auto on dev           → liga com tema específico
 *   .auto off              → desliga
 *   .auto tempo 120        → muda o intervalo, em minutos
 *   .auto tema idiomas     → troca o tema
 *   .auto agora            → força uma entrega imediata (teste)
 *   .auto grupos           → visão de todos os grupos
 */

const auto = require('../../services/autoContentService')
const { TEMAS, TEMA_BY_KEY, detectarTema, resolverTema, INTERVALO_MINIMO_MIN } = require('../../config/autoContent')
const { resolveGroupName } = require('../../utils/groupLabel')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

function formatarIntervalo(min) {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h && m) return `${h}h ${m}min`
    if (h) return `${h}h`
    return `${m}min`
}

function proximaEm(cfg) {
    if (!cfg || !cfg.ativo) return '—'
    const alvo = (cfg.ultimaEm || 0) + (cfg.intervaloMin * 60 * 1000)
    const faltam = alvo - Date.now()
    if (faltam <= 0) return 'a qualquer momento'
    return `em ${formatarIntervalo(Math.ceil(faltam / 60000))}`
}

function linhasTemas() {
    return TEMAS.map(x => `• ${x.emoji} \`${x.chave}\` — ${x.label}`)
}

module.exports = {
    name: 'auto',
    aliases: ['autocontent', 'automatico', 'conteudoauto'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Envio automático de conteúdo no grupo, com tema e intervalo próprios',
    usage: '[on [tema] | off | tema <chave> | tempo <minutos> | agora | grupos]',
    examples: [
        ' — mostra o estado do envio automático neste grupo',
        'on — liga aqui, com o tema deduzido do nome do grupo',
        'on dev — liga aqui com o tema de programação',
        'tempo 120 — manda um conteúdo a cada 2 horas',
        'grupos — mostra todos os grupos e quais estão ligados'
    ],
    ownerOnly: false,
    adminOnly: true,
    groupOnly: false,
    cooldownMs: 2000,
    execute: async ({ args, reply, prefix = '.', from, isGroup, client, sender }) => {
        const sub = (args[0] || '').toLowerCase().trim()

        try {
            // ── Controle em Massa (Todos os grupos ou Skycode) ─────────
            const sub2 = (args[1] || '').toLowerCase().trim()
            const ehAll = ['all', 'todos', 'tudo'].includes(sub) || ['all', 'todos', 'tudo'].includes(sub2)
            const ehSkycode = sub === 'skycode' || sub2 === 'skycode'

            if (ehAll || ehSkycode) {
                const ownerService = require('../../services/ownerService')
                if (!ownerService.isOwner(sender)) {
                    return reply(F.tela({
                        emoji: '🔒',
                        titulo: 'Comando Reservado ao Dono',
                        intro: 'Ações de autonomia em massa são exclusivas dos Donos do bot.',
                        prefix
                    }))
                }

                const ligar = ['on', 'ligar', 'ativar', '1'].includes(sub) || ['on', 'ligar', 'ativar', '1'].includes(sub2)
                const desligar = ['off', 'desligar', 'desativar', '0'].includes(sub) || ['off', 'desligar', 'desativar', '0'].includes(sub2)

                if (ligar) {
                    const res = await auto.ativarTodos(client, { filtroSkycode: ehSkycode })
                    const linhas = res.grupos.slice(0, 10).map(g => `• 🟢 *${g.nome.slice(0, 24)}* — ${g.tema}`)
                    if (res.grupos.length > 10) linhas.push(`_... e mais ${res.grupos.length - 10} grupo(s)._`)

                    return reply(F.tela({
                        emoji: '🟢',
                        titulo: ehSkycode ? 'Autonomia ligada nos grupos Skycode' : 'Autonomia ligada em todos os grupos',
                        intro: `Ativei o conteúdo automático em *${res.ativados} de ${res.total}* grupo(s) com temas deduzidos pelo nome.`,
                        secoes: [{ emoji: '📋', titulo: 'Grupos Ativados', linhas: linhas.length ? linhas : ['Nenhum grupo elegível encontrado.'] }],
                        proximos: [{ nome: 'auto grupos', oque: 'ver a lista completa' }],
                        prefix
                    }))
                }

                if (desligar) {
                    const res = await auto.desativarTodos(client, { filtroSkycode: ehSkycode })
                    return reply(F.tela({
                        emoji: '🔴',
                        titulo: ehSkycode ? 'Autonomia desligada nos grupos Skycode' : 'Autonomia desligada em todos os grupos',
                        intro: `Desativei o conteúdo automático em *${res.desativados} de ${res.total}* grupo(s).`,
                        proximos: [{ nome: ehSkycode ? 'auto skycode on' : 'auto all on', oque: 'ligar tudo de novo' }],
                        prefix
                    }))
                }
            }

            // ── Visão geral de todos os grupos ────────────────────────
            if (['grupos', 'todos', 'lista'].includes(sub)) {
                const ownerService = require('../../services/ownerService')
                if (!ownerService.isOwner(sender)) {
                    return reply(F.tela({
                        emoji: '🔒',
                        titulo: 'Comando Reservado ao Dono',
                        intro: 'A visualização global de grupos é exclusiva dos Donos do bot.',
                        prefix
                    }))
                }
                const todos = await client.groupFetchAllParticipating()
                const lista = Object.values(todos || {})
                let ativos = 0
                const linhas = []
                for (const g of lista) {
                    const cfg = auto.getConfig(g.id)
                    const t = cfg ? (TEMA_BY_KEY[cfg.tema] || TEMA_BY_KEY.geral) : detectarTema(g.subject)
                    const on = cfg && cfg.ativo
                    if (on) ativos++
                    linhas.push(`${on ? '🟢' : '⚪'} *${String(g.subject || 'Grupo sem nome').slice(0, 26)}*`)
                    linhas.push(`   ${t.emoji} ${t.label}${on ? ` · a cada ${formatarIntervalo(cfg.intervaloMin)}` : ' · _desligado_'}`)
                }
                return reply(F.tela({
                    emoji: '🤖',
                    titulo: 'Conteúdo automático nos grupos',
                    intro: lista.length
                        ? `*${ativos} de ${lista.length}* grupo(s) recebem conteúdo sozinhos.`
                        : 'Ainda não estou em nenhum grupo. Quando me adicionarem, eles aparecem aqui com o tema e o ritmo de envio.',
                    secoes: [{ emoji: '📋', titulo: 'Grupos', linhas }],
                    dica: 'O envio é ligado dentro de cada grupo, não daqui.',
                    proximos: [
                        { nome: 'auto on', oque: 'rode dentro do grupo para ligar lá' },
                        { nome: 'auto', oque: 'rode dentro do grupo para ver o estado dele' }
                    ],
                    prefix
                }))
            }

            if (!isGroup) {
                return reply(F.tela({
                    emoji: '📍',
                    titulo: 'Rode dentro de um grupo',
                    intro: 'O conteúdo automático é configurado grupo a grupo, então preciso que você use o comando lá dentro.',
                    proximos: [
                        { nome: 'auto grupos', oque: 'ver todos os grupos daqui mesmo' }
                    ],
                    prefix
                }))
            }

            const nome = await resolveGroupName(from, 'AUTO')
            const cfg = auto.getConfig(from)
            const nomeGrupo = nome ? `*${nome}*` : 'este grupo'
            const emGrupo = nome ? `em *${nome}*` : 'neste grupo'

            // ── Estado ────────────────────────────────────────────────
            if (!sub || ['status', 'ver'].includes(sub)) {
                const t = cfg ? (TEMA_BY_KEY[cfg.tema] || TEMA_BY_KEY.geral) : detectarTema(nome || '')
                const ligado = !!(cfg && cfg.ativo)
                const estado = [
                    F.campo('Grupo', nomeGrupo, '📍'),
                    F.campo('Estado', ligado ? 'ligado' : 'desligado', ligado ? '🟢' : '🔴'),
                    F.campo('Tema', `${t.label}${cfg ? '' : ' _(deduzido do nome)_'}`, t.emoji)
                ]
                if (ligado) {
                    estado.push(F.campo('Intervalo', formatarIntervalo(cfg.intervaloMin), '⏱️'))
                    estado.push(F.campo('Próxima entrega', proximaEm(cfg), '📅'))
                    estado.push(F.campo('Já enviados', `${(cfg.enviados || []).length} item(ns)`, '📦'))
                }
                return reply(F.tela({
                    emoji: '🤖',
                    titulo: 'Conteúdo automático',
                    intro: ligado
                        ? `Estou mandando conteúdo de ${t.label} ${emGrupo} a cada ${formatarIntervalo(cfg.intervaloMin)}.`
                        : `O envio automático está desligado ${emGrupo}. Ligando, eu mando sozinho textos com título, autor, fonte e PDF quando houver.`,
                    secoes: [
                        { emoji: '📋', titulo: 'Estado', linhas: estado },
                        { emoji: '⚙️', titulo: 'Comandos', linhas: [
                            `• ${F.cmd(prefix, 'auto on')} — liga aqui`,
                            `• ${F.cmd(prefix, 'auto off')} — desliga`,
                            `• ${F.cmd(prefix, 'auto tema', '<chave>')} — troca o tema`,
                            `• ${F.cmd(prefix, 'auto tempo', '<minutos>')} — muda o ritmo (mínimo ${INTERVALO_MINIMO_MIN})`,
                            `• ${F.cmd(prefix, 'auto agora')} — manda um agora, para testar`,
                            `• ${F.cmd(prefix, 'auto grupos')} — todos os grupos`
                        ] },
                        { emoji: '🎨', titulo: 'Temas', linhas: linhasTemas() }
                    ],
                    prefix
                }))
            }

            // ── Ligar ─────────────────────────────────────────────────
            if (['on', 'ligar', 'ativar'].includes(sub)) {
                const temaPedido = args[1] ? resolverTema(args[1]) : null
                if (args[1] && !temaPedido) {
                    return reply(F.tela({
                        emoji: '❌',
                        titulo: 'Tema não encontrado',
                        intro: `Não conheço o tema \`${args[1]}\`. Escolha um destes:`,
                        secoes: [{ emoji: '🎨', titulo: 'Temas', linhas: linhasTemas() }],
                        proximos: [{ nome: 'auto on', args: TEMAS[0].chave, oque: `liga com o tema ${TEMAS[0].label}` }],
                        prefix
                    }))
                }
                const novo = await auto.ativar(from, { tema: temaPedido, nomeGrupo: nome || '' })
                const t = TEMA_BY_KEY[novo.tema]
                return reply(F.tela({
                    emoji: '🟢',
                    titulo: 'Conteúdo automático ligado',
                    intro: `A partir de agora eu mando conteúdo ${emGrupo} sozinho. Cada entrega traz título, autor, fonte e o PDF quando disponível.`,
                    secoes: [{ emoji: '📋', titulo: 'Configuração', linhas: [
                        F.campo('Tema', `${t.label}${temaPedido ? '' : ' _(deduzido do nome do grupo)_'}`, t.emoji),
                        F.campo('Intervalo', formatarIntervalo(novo.intervaloMin), '⏱️'),
                        F.campo('Primeira entrega', proximaEm(novo), '📅')
                    ] }],
                    proximos: [
                        { nome: 'auto agora', oque: 'ver uma entrega agora mesmo' },
                        { nome: 'auto tema', args: '<chave>', oque: 'trocar o tema' }
                    ],
                    prefix
                }))
            }

            if (['off', 'desligar', 'desativar'].includes(sub)) {
                const r = await auto.desativar(from)
                if (!r) {
                    return reply(F.tela({
                        emoji: '⚠️',
                        titulo: 'Já estava desligado',
                        intro: `O conteúdo automático não estava ligado ${emGrupo}.`,
                        proximos: [{ nome: 'auto on', oque: 'ligar aqui' }],
                        prefix
                    }))
                }
                return reply(F.tela({
                    emoji: '🔴',
                    titulo: 'Conteúdo automático desligado',
                    intro: `Parei de mandar conteúdo ${emGrupo}.`,
                    dica: 'Guardei o histórico: se você religar, não repito o que já mandei.',
                    proximos: [{ nome: 'auto on', oque: 'religar aqui' }],
                    prefix
                }))
            }

            // ── Tema ──────────────────────────────────────────────────
            if (['tema', 'theme'].includes(sub)) {
                const k = resolverTema(args[1])
                if (!k) {
                    return reply(F.tela({
                        emoji: '🎨',
                        titulo: args[1] ? 'Tema não encontrado' : 'Escolha um tema',
                        intro: args[1]
                            ? `Não conheço o tema \`${args[1]}\`. Estes são os disponíveis:`
                            : 'Diga qual tema quer usar neste grupo. Estes são os disponíveis:',
                        secoes: [{ emoji: '📋', titulo: 'Temas', linhas: linhasTemas() }],
                        proximos: [{ nome: 'auto tema', args: TEMAS[0].chave, oque: `troca para ${TEMAS[0].label}` }],
                        prefix
                    }))
                }
                const novo = await auto.ativar(from, { tema: k, nomeGrupo: nome || '' })
                const t = TEMA_BY_KEY[novo.tema]
                return reply(F.tela({
                    emoji: t.emoji,
                    titulo: `Tema trocado para ${t.label}`,
                    intro: `As próximas entregas ${emGrupo} vão ser desse tema.`,
                    secoes: [{ emoji: '📋', titulo: 'Configuração', linhas: [
                        F.campo('Intervalo', formatarIntervalo(novo.intervaloMin), '⏱️'),
                        F.campo('Próxima entrega', proximaEm(novo), '📅')
                    ] }],
                    proximos: [{ nome: 'auto agora', oque: 'ver uma entrega do tema novo' }],
                    prefix
                }))
            }

            // ── Intervalo ─────────────────────────────────────────────
            if (['tempo', 'intervalo', 'ritmo'].includes(sub)) {
                const min = parseInt(args[1], 10)
                if (!Number.isFinite(min)) {
                    return reply(F.tela({
                        emoji: '⏱️',
                        titulo: 'Diga o intervalo em minutos',
                        intro: `Informe de quantos em quantos minutos eu mando conteúdo aqui. O mínimo é ${INTERVALO_MINIMO_MIN}.`,
                        secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                            `• ${F.cmd(prefix, 'auto tempo', '60')} — a cada 1 hora`,
                            `• ${F.cmd(prefix, 'auto tempo', '150')} — a cada 2h 30min`
                        ] }],
                        prefix
                    }))
                }
                if (min < INTERVALO_MINIMO_MIN) {
                    return reply(F.tela({
                        emoji: '❌',
                        titulo: 'Intervalo curto demais',
                        intro: `O mínimo é *${INTERVALO_MINIMO_MIN} minutos*. Abaixo disso o grupo fica lotado de mensagens.`,
                        proximos: [{ nome: 'auto tempo', args: String(INTERVALO_MINIMO_MIN), oque: 'usar o mínimo permitido' }],
                        prefix
                    }))
                }
                const novo = await auto.ativar(from, { intervaloMin: min, nomeGrupo: nome || '' })
                return reply(F.tela({
                    emoji: '⏱️',
                    titulo: `Intervalo trocado para ${formatarIntervalo(novo.intervaloMin)}`,
                    intro: `Próxima entrega ${emGrupo}: ${proximaEm(novo)}.`,
                    prefix
                }))
            }

            // ── Entrega imediata ──────────────────────────────────────
            if (['agora', 'now', 'testar', 'teste'].includes(sub)) {
                const atual = auto.getConfig(from)
                if (!atual) {
                    return reply(F.tela({
                        emoji: '❌',
                        titulo: 'Ligue primeiro',
                        intro: `O envio automático ainda não foi configurado ${emGrupo}, então não tenho o que mandar.`,
                        proximos: [{ nome: 'auto on', oque: 'ligar aqui e depois testar' }],
                        prefix
                    }))
                }

                await reply('⏳ Buscando conteúdo...')
                // Zera o relógio deste grupo e roda o ciclo normal — testar pelo
                // mesmo caminho que roda sozinho evita "funciona no teste e falha
                // na hora certa".
                atual.ultimaEm = 0
                atual.ativo = true
                await auto.ativar(from, { tema: atual.tema, intervaloMin: atual.intervaloMin, nomeGrupo: nome || '' })
                const cfgZerado = auto.getConfig(from)
                cfgZerado.ultimaEm = 0
                const dataService = require('../../services/dataService')
                const configs = dataService.getConfigsData()
                configs[from].autoContent = cfgZerado
                await dataService.saveConfigsData(configs)

                await auto.tick()
                return reply(F.tela({
                    emoji: '✅',
                    titulo: 'Entrega disparada',
                    intro: 'Mandei buscar um conteúdo para este grupo agora.',
                    dica: 'Se nada chegar em instantes, o tema não encontrou conteúdo: experimente outro tema.',
                    proximos: [{ nome: 'auto tema', args: '<chave>', oque: 'trocar o tema' }],
                    prefix
                }))
            }

            return reply(F.tela({
                emoji: '❓',
                titulo: 'Opção não reconhecida',
                intro: `Não entendi ${F.cmd(prefix, 'auto', sub)}.`,
                proximos: [{ nome: 'auto', oque: 'ver o estado e todas as opções' }],
                prefix
            }))
        } catch (err) {
            logger.error('[AUTO CMD ERROR]', { sub, from, erro: err?.message, stack: err?.stack })
            return reply(F.tela({
                emoji: '❌',
                titulo: 'Não consegui mexer no conteúdo automático',
                intro: 'Algo deu errado do meu lado. Nada foi perdido: tente de novo em instantes.',
                proximos: [{ nome: 'auto', oque: 'conferir o estado atual' }],
                prefix
            }))
        }
    }
}
