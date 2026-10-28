/**
 * Comando Executivo .skycode — Protocolo & Painel Skycode
 *
 * Central técnica exclusiva do Dono e Co-Dono:
 * - Estado do sistema em tempo real (RAM, CPU, Uptime, SQLite, Baileys, Fila de Mídia)
 * - Gestão e visualização de todos os 19 módulos do cluster
 * - Auditoria de cadastros e identidades reais autenticadas (.login)
 * - Diagnóstico profundo de infraestrutura (SQLite, ffmpeg, yt-dlp, cookies)
 * - Monitoramento da fila de downloads e workers concorrentes
 * - Referência completa de variáveis/placeholders de automação de grupos
 */

const os = require('os')
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const moduleState = require('../../services/moduleStateService')
const { MODULES, resolveModuleKey } = require('../../config/modules')
const { mediaQueue } = require('../../services/mediaQueue')
const dataService = require('../../services/dataService')
const env = require('../../config/env')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const parts = []
    if (d > 0) parts.push(`${d}d`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    parts.push(`${s}s`)
    return parts.join(' ')
}

function countByModule(dispatcher) {
    const counts = {}
    for (const cmd of dispatcher.getCommands().values()) {
        const k = resolveModuleKey(cmd)
        counts[k] = (counts[k] || 0) + 1
    }
    return counts
}

function ondeFica(scope, isGroup) {
    return scope === moduleState.PV_SCOPE ? 'no privado' : (isGroup ? 'neste grupo' : 'nesta conversa')
}

module.exports = {
    name: 'skycode',
    aliases: ['sky', 'painelskycode', 'skystatus', 'skydiag', 'skychaves', 'skyauditoria', 'skymodulos', 'skyfila', 'skygrupos'],
    category: 'owner',
    subcategory: 'Protocolo Skycode',
    description: 'Painel técnico do dono: saúde do sistema, módulos, fila de downloads e cadastros',
    usage: '[status | modulos | diagnostico | fila | auditoria | chaves | grupos | on [all] | off [all]]',
    examples: [
        ' — painel geral com memória, comandos e fila',
        'diagnostico — testa banco de dados, ffmpeg, yt-dlp e cookies',
        'modulos — mostra o que está ligado aqui',
        'chaves — variáveis para mensagens de boas-vindas e saída',
        'on — libera o Skycode aqui'
    ],
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.', from, isGroup, args = [], text = '', commandName = 'skycode', client, sender }) => {
        const dispatcher = require('../../handlers/commandDispatcher')
        const scope = moduleState.scopeOf(from, isGroup)
        const onde = ondeFica(scope, isGroup)

        const safeArgs = (Array.isArray(args) && args.length > 0) ? args : String(text || '').trim().split(/\s+/).filter(Boolean)

        // Roteamento inteligente por alias ou primeiro argumento
        let sub = (safeArgs[0] || '').toLowerCase()
        if (commandName === 'skystatus') sub = 'status'
        else if (commandName === 'skymodulos') sub = 'modulos'
        else if (commandName === 'skydiag') sub = 'diagnostico'
        else if (commandName === 'skychaves') sub = 'chaves'
        else if (commandName === 'skyauditoria') sub = 'auditoria'
        else if (commandName === 'skyfila') sub = 'fila'
        else if (commandName === 'skygrupos') sub = 'grupos'

        const voltar = { nome: 'skycode', oque: 'voltar ao painel' }

        // 0.1 GESTÃO DE RESPOSTAS AUTÔNOMAS POR NICHO (.skycode autoresposta)
        if (sub === 'autoresposta' || sub === 'autoreply') {
            const autonomousGroup = require('../../services/groupAutonomousAgentService')
            const action = (safeArgs[1] || '').toLowerCase()
            const targetAll = (safeArgs[2] || '').toLowerCase() === 'all' || (safeArgs[2] || '').toLowerCase() === 'tudo'

            if (action === 'on' || action === 'ligar' || action === 'ativar') {
                const res = await autonomousGroup.setAutoReplyAll(client, true, { filtroSkycode: !targetAll })
                return reply(F.tela({
                    emoji: '🟢',
                    titulo: targetAll ? 'Auto-Resposta ligada em todos os grupos' : 'Auto-Resposta ligada nos grupos Skycode',
                    intro: `Respostas inteligentes 24h ativadas em *${res.alterados} de ${res.total}* grupo(s).`,
                    proximos: [
                        { nome: 'skycode', oque: 'voltar ao painel técnico' },
                        voltar
                    ],
                    prefix
                }))
            }

            if (action === 'off' || action === 'desligar' || action === 'desativar') {
                const res = await autonomousGroup.setAutoReplyAll(client, false, { filtroSkycode: !targetAll })
                return reply(F.tela({
                    emoji: '🔴',
                    titulo: targetAll ? 'Auto-Resposta desligada em todos os grupos' : 'Auto-Resposta desligada nos grupos Skycode',
                    intro: `Respostas inteligentes desativadas em *${res.alterados} de ${res.total}* grupo(s).`,
                    proximos: [
                        { nome: 'skycode', args: 'autoresposta on', oque: 'religar tudo' },
                        voltar
                    ],
                    prefix
                }))
            }

            const health = autonomousGroup.get24hHealthStatus()
            return reply(F.tela({
                emoji: '🤖',
                titulo: 'Motor de Auto-Resposta 24H (Rede)',
                intro: `Status: *${health.status}*\nGrupos com resposta ativa: *${health.totalGruposReply}*`,
                proximos: [
                    { nome: 'skycode', args: 'autoresposta on', oque: 'ativar nos grupos Skycode' },
                    { nome: 'skycode', args: 'autoresposta off', oque: 'desativar nos grupos Skycode' },
                    voltar
                ],
                prefix
            }))
        }

        // 0. GESTÃO DE INTERAÇÕES AUTÔNOMAS DOS GRUPOS SKYCODE (.skycode auto)
        if (sub === 'auto' || sub === 'autonomia' || sub === 'automatico') {
            const autoService = require('../../services/autoContentService')
            const action = (safeArgs[1] || '').toLowerCase()
            const targetAll = (safeArgs[2] || '').toLowerCase() === 'all' || (safeArgs[2] || '').toLowerCase() === 'tudo'

            if (action === 'on' || action === 'ligar' || action === 'ativar') {
                const res = await autoService.ativarTodos(client, { filtroSkycode: !targetAll })
                return reply(F.tela({
                    emoji: '🟢',
                    titulo: targetAll ? 'Autonomia ativada em todos os grupos' : 'Autonomia ativada nos grupos Skycode',
                    intro: `Interações automáticas (vagas, vendas, futebol, dev) ligadas em *${res.ativados}* grupo(s).`,
                    proximos: [
                        { nome: 'skycode', args: 'auto', oque: 'conferir o painel de grupos' },
                        voltar
                    ],
                    prefix
                }))
            }

            if (action === 'off' || action === 'desligar' || action === 'desativar') {
                const res = await autoService.desativarTodos(client, { filtroSkycode: !targetAll })
                return reply(F.tela({
                    emoji: '🔴',
                    titulo: targetAll ? 'Autonomia desativada em todos os grupos' : 'Autonomia desativada nos grupos Skycode',
                    intro: `Interações automáticas desligadas em *${res.desativados}* grupo(s).`,
                    proximos: [
                        { nome: 'skycode', args: 'auto on', oque: 'religar tudo' },
                        voltar
                    ],
                    prefix
                }))
            }

            // Exibição do Painel de Autonomia
            try {
                const groups = client?.groupFetchAllParticipating ? await client.groupFetchAllParticipating() : {}
                const lista = Object.values(groups || {})
                const { TEMA_BY_KEY, detectarTema } = require('../../config/autoContent')

                let ativos = 0
                const linhas = []
                for (const g of lista) {
                    const cfg = autoService.getConfig(g.id)
                    const t = cfg ? (TEMA_BY_KEY[cfg.tema] || TEMA_BY_KEY.geral) : detectarTema(g.subject)
                    const on = cfg && cfg.ativo
                    if (on) ativos++
                    linhas.push(`${on ? '🟢' : '⚪'} *${String(g.subject || 'Grupo').slice(0, 24)}*`)
                    linhas.push(`   ${t.emoji} ${t.label} · ${on ? 'Ativo' : 'Pausado'}`)
                }

                return reply(F.tela({
                    emoji: '🤖',
                    titulo: 'Autonomia dos Grupos Skycode',
                    intro: `*${ativos} de ${lista.length}* grupo(s) com radar, boas-vindas e pílulas automáticas ativas.`,
                    secoes: [
                        { emoji: '📋', titulo: 'Status por Grupo', linhas: linhas.length ? linhas : ['Nenhum grupo ativo no momento.'] },
                        { emoji: '⚡', titulo: 'Comandos de Controle', linhas: [
                            `• \`${prefix}skycode auto on\` — liga em todos os grupos Skycode`,
                            `• \`${prefix}skycode auto off\` — desliga em todos os grupos Skycode`,
                            `• \`${prefix}skycode auto on all\` — liga em absolutamente TODOS os grupos`,
                            `• \`${prefix}skycode auto off all\` — desliga em absolutamente TODOS os grupos`
                        ] }
                    ],
                    proximos: [
                        { nome: 'skycode', args: 'auto on', oque: 'ligar em todos os grupos Skycode' },
                        voltar
                    ],
                    prefix
                }))
            } catch (err) {
                return reply(`❌ Erro ao listar status de autonomia: ${err.message}`)
            }
        }

        // 1. ATIVAÇÃO / DESATIVAÇÃO DO PROTOCOLO SKYCODE NO ESCOPO
        if (sub === 'on' || sub === 'ativar' || sub === '1') {
            const targetAll = (safeArgs[1] || '').toLowerCase() === 'all' || (safeArgs[1] || '').toLowerCase() === 'tudo'
            if (targetAll) {
                moduleState.enableAll(scope)
                moduleState.setModule('skycode', true, scope)
                return reply(F.tela({
                    emoji: '🟢',
                    titulo: 'Skycode e todos os módulos ligados',
                    intro: `Liguei o Skycode e todos os outros módulos ${onde}.`,
                    proximos: [{ nome: 'skycode', args: 'modulos', oque: 'conferir o que ficou ligado' }],
                    prefix
                }))
            }
            moduleState.setModule('skycode', true, scope)
            return reply(F.tela({
                emoji: '🟢',
                titulo: 'Skycode ligado',
                intro: `Os comandos técnicos do Skycode estão liberados ${onde}, só para os donos.`,
                proximos: [
                    { nome: 'skycode', args: 'on all', oque: 'ligar também todos os outros módulos' },
                    voltar
                ],
                prefix
            }))
        }

        if (sub === 'off' || sub === 'desativar' || sub === '0') {
            const targetAll = (safeArgs[1] || '').toLowerCase() === 'all' || (safeArgs[1] || '').toLowerCase() === 'tudo'
            if (targetAll) {
                moduleState.disableAll(scope)
                return reply(F.tela({
                    emoji: '🔴',
                    titulo: 'Todos os módulos desligados',
                    intro: `Desliguei todos os módulos ${onde}.`,
                    proximos: [{ nome: 'skycode', args: 'on all', oque: 'ligar tudo de novo' }],
                    prefix
                }))
            }
            moduleState.setModule('skycode', false, scope)
            return reply(F.tela({
                emoji: '🔴',
                titulo: 'Skycode desligado',
                intro: `Os comandos técnicos do Skycode ficaram restritos ${onde}.`,
                proximos: [{ nome: 'skycode', args: 'on', oque: 'ligar de novo' }],
                prefix
            }))
        }

        // 2. CHAVES & VARIÁVEIS DE AUTOMATIZAÇÃO DE GRUPOS (.skycode chaves)
        if (sub === 'chaves' || sub === 'variaveis' || sub === 'placeholders') {
            return reply(F.tela({
                emoji: '🔑',
                titulo: 'Variáveis das mensagens do grupo',
                intro: 'Escreva estas palavras entre chaves nas mensagens de boas-vindas e saída; eu troco pelo valor na hora de enviar.',
                secoes: [
                    { emoji: '🧩', titulo: 'Variáveis', linhas: [
                        '• `{user}` ou `{membro}` — marca a pessoa',
                        '• `{grupo}` ou `{nome}` — nome do grupo',
                        '• `{desc}` — descrição do grupo',
                        '• `{membros}` — quantos membros há agora',
                        '• `{hora}` — horário de Brasília (HH:MM:SS)',
                        '• `{data}` — data de hoje (DD/MM/AAAA)',
                        '• `{prefix}` — o prefixo usado aqui',
                        '• `{dono}` — contato dos administradores'
                    ] },
                    { emoji: '💡', titulo: 'Exemplos', linhas: [
                        `• ${F.cmd(prefix, 'welcome', 'msg Olá {user}! Boas-vindas ao {grupo}. Agora somos {membros}!')}`,
                        `• ${F.cmd(prefix, 'leave', 'msg {user} saiu do {grupo}. Restaram {membros} membros.')}`
                    ] }
                ],
                prefix
            }))
        }

        // 3. AUDITORIA DE MEMBROS E IDENTIDADES REAIS (.skycode auditoria)
        if (sub === 'auditoria' || sub === 'cadastros' || sub === 'membros') {
            const topSky = dataService.userRepo.getTopSkycode ? dataService.userRepo.getTopSkycode(10) : []
            const regCount = dataService.userRepo.getRegisteredCount ? dataService.userRepo.getRegisteredCount() : 0

            const top = topSky.map(([jid, u], i) => {
                const num = jid.split('@')[0]
                const nick = u.displayNick || u.display_nick || u.name || `@${num}`
                return `*${i + 1}.* ${nick} (@${num})\n   Grupo nv. ${u.levelGroup || u.level_group || 1} · Privado nv. ${u.levelPv || u.level_pv || 1} · RPG nv. ${u.levelRpg || u.level_rpg || 1}`
            })

            return reply(F.tela({
                emoji: '🛰️',
                titulo: 'Cadastros com login',
                intro: `*${regCount}* pessoa(s) se cadastraram comigo usando ${F.cmd(prefix, 'login')}.`,
                secoes: [
                    { emoji: '🏆', titulo: 'Mais ativos entre os cadastrados', linhas: top.length
                        ? top
                        : [`Ninguém se cadastrou ainda. Quando alguém usar ${F.cmd(prefix, 'login')}, aparece aqui com os níveis de grupo, privado e RPG.`] }
                ],
                proximos: [
                    { nome: 'rank', args: 'skycode', oque: 'ver o ranking completo' },
                    voltar
                ],
                prefix
            }))
        }

        // 4. DIAGNÓSTICO PROFUNDO EM TEMPO REAL (.skycode diagnostico)
        if (sub === 'diagnostico' || sub === 'diag' || sub === 'teste') {
            const diagStart = Date.now()

            // Teste 1: SQLite Latência
            let dbStatus = '🟢 OK'
            let dbTime = 0
            try {
                const dbT0 = Date.now()
                dataService.userRepo.getRegisteredCount()
                dbTime = Date.now() - dbT0
            } catch (e) {
                logger.error('[SKYCODE DIAG] banco de dados falhou no teste', { erro: e?.message, stack: e?.stack })
                dbStatus = '🔴 falhou (detalhe no registro de erros)'
            }

            // Teste 2: FFmpeg e FFprobe
            let ffmpegStatus = '🟢 instalado'
            try {
                const ff = spawnSync('ffmpeg', ['-version'])
                if (ff.status !== 0) ffmpegStatus = '⚠️ respondeu com erro'
            } catch (e) {
                logger.warn('[SKYCODE DIAG] ffmpeg indisponível', { erro: e?.message })
                ffmpegStatus = '🔴 não encontrado'
            }

            // Teste 3: yt-dlp e Cookies
            const { validateCookiesFile } = require('../../services/media/mediaArgs')
            const cookieStatus = validateCookiesFile()
            let ytdlpStatus = '🟢 instalado'
            try {
                const yt = spawnSync('yt-dlp', ['--version'])
                if (yt.status === 0) {
                    ytdlpStatus = `🟢 versão ${(yt.stdout || '').toString().trim()}`
                } else {
                    ytdlpStatus = '⚠️ respondeu com erro'
                }
            } catch (e) {
                logger.warn('[SKYCODE DIAG] yt-dlp indisponível', { erro: e?.message })
                ytdlpStatus = '🔴 não encontrado'
            }

            // Teste 4: Memória & Fila
            const memUsage = process.memoryUsage()
            const heapMb = (memUsage.heapUsed / 1024 / 1024).toFixed(1)
            const rssMb = (memUsage.rss / 1024 / 1024).toFixed(1)
            const queueStatus = mediaQueue.getStatus ? mediaQueue.getStatus() : { active: mediaQueue.activeCount, queued: mediaQueue.queue.length }

            const problemas = [dbStatus, ffmpegStatus, ytdlpStatus].filter(x => !x.startsWith('🟢')).length + (cookieStatus.ok ? 0 : 1)

            return reply(F.tela({
                emoji: '🔬',
                titulo: 'Diagnóstico do sistema',
                intro: problemas
                    ? `Encontrei *${problemas}* ponto(s) de atenção. Os downloads podem falhar enquanto isso não for resolvido.`
                    : 'Tudo respondeu bem: banco, ferramentas de mídia e cookies.',
                secoes: [
                    { emoji: '⚙️', titulo: 'Peças', linhas: [
                        F.campo('Dados salvos', `${dbStatus} (${dbTime} ms)`, '💾'),
                        F.campo('ffmpeg (conversão de mídia)', ffmpegStatus, '🎞️'),
                        F.campo('yt-dlp (downloads)', ytdlpStatus, '📥'),
                        F.campo('Cookies de download', cookieStatus.ok ? `🟢 ${cookieStatus.count} cookies (${cookieStatus.domain})` : `⚠️ ${cookieStatus.reason}`, '🍪')
                    ] },
                    { emoji: '📊', titulo: 'Uso agora', linhas: [
                        F.campo('Fila de mídia', `${queueStatus.active} em andamento · ${queueStatus.queued} esperando (máx. ${mediaQueue.maxConcurrency})`, '🧠'),
                        F.campo('Memória', `${heapMb} MB (total do processo: ${rssMb} MB)`, '📈'),
                        F.campo('Teste levou', `${Date.now() - diagStart} ms`, '⏱️')
                    ] }
                ],
                proximos: [{ nome: 'skycode', args: 'fila', oque: 'ver a fila de downloads' }, voltar],
                prefix
            }))
        }

        // 5. MONITOR DA FILA DE DOWNLOADS (.skycode fila)
        if (sub === 'fila' || sub === 'queue' || sub === 'downloads') {
            const queueStatus = mediaQueue.getStatus ? mediaQueue.getStatus() : { active: mediaQueue.activeCount, queued: mediaQueue.queue.length }
            const primeiros = mediaQueue.queue.slice(0, 5).map((j, idx) =>
                `*${idx + 1}.* [${String(j.format || '').toUpperCase()}] ${String(j.url || '').slice(0, 35)}... (@${j.user ? j.user.split('@')[0] : 'alguém'})`
            )

            return reply(F.tela({
                emoji: '📥',
                titulo: 'Fila de downloads',
                intro: `${queueStatus.active} download(s) em andamento e ${queueStatus.queued} esperando a vez.`,
                secoes: [
                    { emoji: '📊', titulo: 'Capacidade', linhas: [
                        F.campo('Ao mesmo tempo', `até ${mediaQueue.maxConcurrency} downloads`, '🚀'),
                        F.campo('Tempo limite por download', `${Math.round((mediaQueue.defaultTimeoutMs || 180000) / 1000)} s`, '⏱️')
                    ] },
                    { emoji: '📋', titulo: 'Próximos da fila', linhas: primeiros.length
                        ? primeiros
                        : ['Ninguém esperando. Quando alguém pedir música ou vídeo e a fila encher, os pedidos aparecem aqui.'] }
                ],
                proximos: [{ nome: 'skycode', args: 'diagnostico', oque: 'testar as ferramentas de download' }, voltar],
                prefix
            }))
        }

        // 6. GESTÃO DETALHADA DE TODOS OS 19 MÓDULOS (.skycode modulos)
        if (sub === 'modulos' || sub === 'mods' || sub === 'lista') {
            const counts = countByModule(dispatcher)
            const list = moduleState.listModules(scope)
            const ligados = list.filter(m => m.enabled).length

            return reply(F.tela({
                emoji: '🛰️',
                titulo: 'Módulos',
                intro: `*${ligados} de ${list.length}* módulos ligados ${onde}. Eles começam desligados e só funcionam depois que alguém liga.`,
                secoes: [
                    { emoji: '📋', titulo: 'Situação', linhas: list.map(m =>
                        `${m.enabled ? '🟢' : '🔴'} ${m.emoji} *${m.label}* _(${counts[m.key] || 0} comandos)_`) },
                    { emoji: '⚡', titulo: 'Controle rápido', linhas: [
                        `• ${F.cmd(prefix, 'modulo', 'on <chave>')} — liga um módulo`,
                        `• ${F.cmd(prefix, 'modulo', 'off <chave>')} — desliga um módulo`,
                        `• ${F.cmd(prefix, 'modulo', 'on all')} — liga tudo aqui`,
                        `• ${F.cmd(prefix, 'modulo', 'off all')} — desliga tudo aqui`
                    ] }
                ],
                prefix
            }))
        }

        // 7. GRUPOS & CHATS GERENCIADOS (.skycode grupos)
        if (sub === 'grupos' || sub === 'chats') {
            try {
                const groups = client?.groupFetchAllParticipating ? await client.groupFetchAllParticipating() : {}
                const totalChats = Object.keys(groups).length
                return reply(F.tela({
                    emoji: '👥',
                    titulo: 'Grupos',
                    intro: totalChats
                        ? `Estou em *${totalChats}* grupo(s) agora.`
                        : 'Não estou em nenhum grupo agora. Quando me adicionarem, a contagem aparece aqui.',
                    secoes: [{ emoji: '📍', titulo: 'Onde você está', linhas: [isGroup ? 'Em um grupo.' : 'No privado.'] }],
                    proximos: [{ nome: 'auto', args: 'grupos', oque: 'ver os grupos com conteúdo automático' }, voltar],
                    prefix
                }))
            } catch (err) {
                logger.error('[SKYCODE] falha ao listar grupos', { erro: err?.message, stack: err?.stack })
                return reply(F.tela({
                    emoji: '❌',
                    titulo: 'Não consegui listar os grupos',
                    intro: 'Não consegui falar com o WhatsApp agora. Tente de novo em instantes.',
                    proximos: [voltar],
                    prefix
                }))
            }
        }

        // 8. DASHBOARD MASTER EXECUTIVO (.skycode ou .skycode status)
        const uptimeStr = formatUptime(process.uptime())
        const mem = process.memoryUsage()
        const heapMb = (mem.heapUsed / 1024 / 1024).toFixed(1)
        const totalMemMb = (os.totalmem() / 1024 / 1024).toFixed(0)
        const freeMemMb = (os.freemem() / 1024 / 1024).toFixed(0)
        const queueStatus = mediaQueue.getStatus ? mediaQueue.getStatus() : { active: mediaQueue.activeCount, queued: mediaQueue.queue.length }
        const skycodeActive = moduleState.isModuleEnabled('skycode', scope)

        return reply(F.tela({
            emoji: '🛰️',
            titulo: 'Painel Skycode',
            intro: `Estou no ar há *${uptimeStr}*. O Skycode está ${skycodeActive ? '🟢 ligado' : '🔴 desligado'} ${onde}.`,
            secoes: [
                { emoji: '📊', titulo: 'Sistema', linhas: [
                    F.campo('Memória usada', `${heapMb} MB · livre na máquina: ${freeMemMb} de ${totalMemMb} MB`, '🧠'),
                    F.campo('Comandos carregados', `${dispatcher.getCommands().size} (+ ${dispatcher.getAliases().size} apelidos)`, '⚡'),
                    F.campo('Fila de downloads', `${queueStatus.active} em andamento · ${queueStatus.queued} esperando (máx. ${mediaQueue.maxConcurrency})`, '📥'),
                    F.campo('Plataforma', `Node ${process.version} (${os.platform()} ${os.arch()})`, '🤖')
                ] },
                { emoji: '🚀', titulo: 'Telas do painel', linhas: [
                    `• ${F.cmd(prefix, 'skycode', 'diagnostico')} — testa banco, ffmpeg, yt-dlp e cookies`,
                    `• ${F.cmd(prefix, 'skycode', 'modulos')} — o que está ligado aqui`,
                    `• ${F.cmd(prefix, 'skycode', 'fila')} — fila de downloads`,
                    `• ${F.cmd(prefix, 'skycode', 'auditoria')} — pessoas cadastradas com login`,
                    `• ${F.cmd(prefix, 'skycode', 'chaves')} — variáveis de boas-vindas e saída`,
                    `• ${F.cmd(prefix, 'skycode', 'grupos')} — quantos grupos eu atendo`,
                    `• ${F.cmd(prefix, 'skycode', 'on')} / ${F.cmd(prefix, 'skycode', 'off')} — liga ou desliga o Skycode aqui`
                ] }
            ],
            dica: `Atalhos diretos: ${prefix}skystatus, ${prefix}skymodulos, ${prefix}skydiag e ${prefix}skychaves.`,
            prefix
        }))
    }
}
