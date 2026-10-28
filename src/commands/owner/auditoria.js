/**
 * Comando .auditoria — raio-x completo do bot.
 *
 * Existe porque "o comando não funciona" tem uma dúzia de causas possíveis
 * (módulo desligado, aluguel, permissão, serviço fora, banco corrompido) e
 * descobrir qual delas exigia abrir o servidor. Aqui tudo aparece de uma vez,
 * com o veredito de cada parte.
 *
 *   .auditoria           → resumo com o que está quebrado
 *   .auditoria completo  → todas as seções, inclusive as saudáveis
 */

const logger = require('../../core/logger')
const F = require('../../utils/formato')

const OK = '✅'
const ALERTA = '⚠️'
const ERRO = '❌'

/** Executa uma checagem sem deixar uma falha derrubar a auditoria inteira. */
async function checar(nome, fn) {
    try {
        return await fn()
    } catch (err) {
        logger.warn(`[AUDITORIA] Seção "${nome}" falhou: ${err.message}`)
        return { sinal: ERRO, linhas: ['Não consegui checar esta parte. O motivo ficou no log do dia.'], problema: true }
    }
}

module.exports = {
    name: 'auditoria',
    aliases: ['audit', 'diagnostico', 'raiox', 'checkup'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Raio-x completo: módulos, grupos, aluguel, serviços, banco e comandos',
    usage: '[completo]',
    examples: [
        ' — mostra só as partes com problema',
        'completo — mostra todas as partes, inclusive as saudáveis'
    ],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, reply, args, prefix = '.' }) => {
        const completo = ['completo', 'full', 'tudo'].includes((args[0] || '').toLowerCase())
        const secoes = []

        // ─── 1. CONEXÃO ───────────────────────────────────────────────
        secoes.push(['Conexão', await checar('conexao', async () => {
            const jid = client?.user?.id || '(desconhecido)'
            const up = process.uptime()
            const h = Math.floor(up / 3600), m = Math.floor((up % 3600) / 60)
            return {
                sinal: client?.user ? OK : ERRO,
                problema: !client?.user,
                linhas: [
                    `Conectado como: ${String(jid).split(':')[0].split('@')[0]}`,
                    `No ar há: ${h}h ${m}min`
                ]
            }
        })])

        // ─── 2. COMANDOS ──────────────────────────────────────────────
        secoes.push(['Comandos', await checar('comandos', async () => {
            const dispatcher = require('../../handlers/commandDispatcher')
            const cmds = dispatcher.getCommands()
            const aliases = dispatcher.getAliases()
            const total = cmds.size ?? Object.keys(cmds).length
            return {
                sinal: total > 0 ? OK : ERRO,
                problema: total === 0,
                linhas: [`Carregados: *${total}* comandos + ${aliases.size ?? 0} nomes alternativos`]
            }
        })])

        // ─── 3. GRUPOS E MÓDULOS ──────────────────────────────────────
        secoes.push(['Grupos e módulos', await checar('grupos', async () => {
            const moduleState = require('../../services/moduleStateService')
            const botProfile = require('../../services/botProfileService')
            const todos = await client.groupFetchAllParticipating()
            const grupos = Object.values(todos || {})

            const mudos = []
            for (const g of grupos) {
                const n = moduleState.listModules(g.id).filter(m => m.enabled).length
                if (n === 0) mudos.push(g)
            }

            const pvOn = moduleState.listModules(moduleState.PV_SCOPE).filter(m => m.enabled).length
            const linhas = [
                `Grupos conectados: *${grupos.length}*`,
                `Privado: ${pvOn > 0 ? `${OK} ${pvOn} módulos` : `${ERRO} nenhum módulo ligado, não respondo no privado`}`
            ]

            if (mudos.length) {
                linhas.push(`${ERRO} *${mudos.length} grupo(s) sem módulo algum:*`)
                for (const g of mudos.slice(0, 5)) linhas.push(`   • ${g.subject || g.id}`)
                if (mudos.length > 5) linhas.push(`   • _+${mudos.length - 5} outros_`)
                linhas.push(`   _Corrija com_ \`${prefix}perfilbot goat <código do grupo>\` _(códigos em_ \`${prefix}grupos mudos\`_)_`)
            } else {
                linhas.push(`${OK} Todos os grupos têm módulos ativos`)
            }

            const comPerfil = grupos.filter(g => botProfile.getActiveProfile(g.id)).length
            linhas.push(`Com perfil definido: ${comPerfil}/${grupos.length}`)

            return { sinal: (mudos.length || pvOn === 0) ? ERRO : OK, problema: mudos.length > 0 || pvOn === 0, linhas }
        })])

        // ─── 4. ALUGUEL ───────────────────────────────────────────────
        secoes.push(['Aluguel', await checar('aluguel', async () => {
            const rental = require('../../services/rentalService')
            const st = rental.getRentalModeState(null, true)
            const ativos = rental.getAllRentalsList().filter(r => r.isActive)
            const linhas = [
                `Modo aluguel: ${st.enabled ? '🛡️ exige assinatura' : '🔓 livre'} _(definido por: ${st.origem})_`,
                `Acessos ativos: ${ativos.length}`
            ]
            // Modo ligado sem nenhum acesso = todo mundo bloqueado.
            const travado = st.enabled && ativos.length === 0
            if (travado) linhas.push(`${ERRO} Modo ligado e nenhum acesso ativo: *todos estão bloqueados*`)
            return { sinal: travado ? ERRO : OK, problema: travado, linhas }
        })])

        // ─── 5. DONOS ─────────────────────────────────────────────────
        secoes.push(['Donos', await checar('donos', async () => {
            const ownerService = require('../../services/ownerService')
            const env = require('../../config/env')
            const donos = ownerService.getOwners().filter(o => o.jid)
            const semEnv = !env.botOwnerId
            const linhas = [
                `Donos cadastrados: *${donos.length}*`,
                ...donos.slice(0, 5).map(o => `   • ${o.rank}: ${String(o.jid).split('@')[0].split(':')[0].replace(/^(\d{6})\d+/, '$1****')}`)
            ]
            if (semEnv) linhas.push(`${ERRO} O dono principal não está definido na configuração do servidor (BOT_OWNER_ID)`)
            return { sinal: (donos.length && !semEnv) ? OK : ERRO, problema: !donos.length || semEnv, linhas }
        })])

        // ─── 6. SERVIÇOS EXTERNOS ─────────────────────────────────────
        secoes.push(['Serviços', await checar('servicos', async () => {
            const linhas = []
            let ruim = false
            const testar = async (nome, url) => {
                try {
                    const ctl = AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
                    const r = await fetch(url, { signal: ctl })
                    linhas.push(`${r.ok ? OK : ALERTA} ${nome}: ${r.ok ? 'respondendo' : `respondeu com erro (${r.status})`}`)
                    if (!r.ok) ruim = true
                } catch (err) {
                    logger.warn(`[AUDITORIA] ${nome} (${url}) sem resposta: ${err.message}`)
                    linhas.push(`${ERRO} ${nome}: sem resposta`)
                    ruim = true
                }
            }
            await testar('Whisper (transcrição)', 'http://whisper:8000/health')
            await testar('Liberação do YouTube', 'http://bgutil-pot-provider:4416/ping')
            return { sinal: ruim ? ALERTA : OK, problema: ruim, linhas }
        })])

        // ─── 7. BANCO DE DADOS ────────────────────────────────────────
        secoes.push(['Dados salvos', await checar('banco', async () => {
            const { q } = require('../../database/connection')
            const integridade = q('PRAGMA integrity_check').get().integrity_check
            const usuarios = q('SELECT COUNT(*) c FROM users').get().c
            const xp = q('SELECT COALESCE(SUM(xp),0) s FROM users').get().s
            const ok = integridade === 'ok'
            return {
                sinal: ok ? OK : ERRO,
                problema: !ok,
                linhas: [
                    `Integridade: ${ok ? 'ok' : integridade}`,
                    `Usuários: *${usuarios}* | XP total: *${Number(xp).toLocaleString('pt-BR')}*`
                ]
            }
        })])

        // ─── 8. CONVERSA NATURAL ──────────────────────────────────────
        secoes.push(['Conversa natural', await checar('conversa', async () => {
            const natural = require('../../services/naturalReplyService')
            const on = natural.isNaturalReplyEnabled(null, true)
            return { sinal: OK, problema: false, linhas: [`Responder sem comando: ${on ? '🟢 ligado' : '🔴 desligado'}`] }
        })])

        // ─── MONTAGEM ─────────────────────────────────────────────────
        const problemas = secoes.filter(([, r]) => r.problema)
        const mostradas = secoes.filter(([, r]) => completo || r.problema || !problemas.length)

        return reply(F.tela({
            prefix,
            emoji: problemas.length ? '🩺' : '✅',
            titulo: problemas.length ? `Auditoria: ${problemas.length} problema(s)` : 'Auditoria: tudo em ordem',
            intro: problemas.length
                ? (completo ? 'Encontrei problemas. Abaixo estão todas as partes checadas.' : 'Encontrei problemas. Abaixo estão só as partes que precisam de atenção.')
                : 'Chequei conexão, comandos, grupos, aluguel, donos, serviços, dados salvos e conversa. Nenhum problema.',
            secoes: mostradas.map(([titulo, r]) => ({ emoji: r.sinal, titulo, linhas: r.linhas })),
            proximos: [
                !completo && problemas.length ? { nome: 'auditoria', args: 'completo', oque: 'ver todas as partes' } : null,
                { nome: 'grupos', oque: 'situação de cada grupo' },
                { nome: 'autofix', oque: 'tentar consertar sozinho' }
            ].filter(Boolean)
        }))
    }
}
