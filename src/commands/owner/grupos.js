/**
 * Comando .grupos — inventário dos grupos onde o bot está.
 *
 * Lista TODOS os grupos vindos do próprio WhatsApp (groupFetchAllParticipating),
 * não só os que têm registro no banco: era justamente aí que um grupo novo
 * sumia da vista e ninguém entendia por que o bot estava mudo lá.
 *
 * Para cada grupo mostra o que decide se o bot RESPONDE:
 *   • módulos ligados naquele ambiente (0 = bot mudo, causa nº 1 de "não funciona")
 *   • perfil de atuação ativo
 *   • situação do aluguel
 *   • se o bot é admin
 */

const logger = require('../../core/logger')
const groupAuthService = require('../../services/groupAuthService')
const moduleState = require('../../services/moduleStateService')
const botProfile = require('../../services/botProfileService')
const rentalService = require('../../services/rentalService')
const F = require('../../utils/formato')

/** Quantos grupos por página — mensagem do WhatsApp tem limite de tamanho. */
const POR_PAGINA = 8

module.exports = {
    name: 'grupos',
    aliases: ['grouplist', 'listagrupos', 'listargrupos', 'listargrupo', 'lsgrupos'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Lista os grupos onde estou, com módulos, perfil e aluguel de cada um',
    usage: '[mudos] [página]',
    examples: [
        ' — primeira página com todos os grupos',
        '2 — segunda página',
        'mudos — só os grupos onde não respondo nada'
    ],
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, reply, args, prefix = '.' }) => {
        try {
            const todos = await client.groupFetchAllParticipating()
            const lista = Object.values(todos || {})

            if (!lista.length) {
                return reply(F.tela({
                    prefix,
                    emoji: '📋',
                    titulo: 'Não estou em nenhum grupo',
                    intro: 'Quando eu entrar em um grupo, ele aparece aqui com módulos, perfil e aluguel.',
                    proximos: [
                        { nome: 'entrar', args: 'https://chat.whatsapp.com/CODIGO', oque: 'me colocar em um grupo pelo convite' }
                    ]
                }))
            }

            const botJids = groupAuthService.getBotJids(client)
            const soMudos = ['mudos', 'off', 'desligados', 'problemas'].includes((args[0] || '').toLowerCase())

            // Anota cada grupo com o que realmente decide se o bot responde ali.
            const anotados = lista.map(g => {
                const modulos = moduleState.listModules(g.id).filter(m => m.enabled).length
                const perfil = botProfile.getActiveProfile(g.id)
                const aluguel = rentalService.getRentalInfo(g.id)
                const modoAluguel = rentalService.isRentalModeEnabled(g.id, true)
                const botAdmin = (g.participants || []).some(p => {
                    const adm = p.admin === 'admin' || p.admin === 'superadmin'
                    if (!adm) return false
                    const pj = groupAuthService.normalizeJid(p.id || p.jid || '')
                    return [...botJids].some(b => b && pj && b === pj)
                })
                return { g, modulos, perfil, aluguel, modoAluguel, botAdmin }
            })

            const mudos = anotados.filter(a => a.modulos === 0)
            const alvo = soMudos ? mudos : anotados
            const pagina = Math.max(1, parseInt(args[soMudos ? 1 : 0], 10) || 1)
            const totalPaginas = Math.max(1, Math.ceil(alvo.length / POR_PAGINA))
            const p = Math.min(pagina, totalPaginas)
            const fatia = alvo.slice((p - 1) * POR_PAGINA, p * POR_PAGINA)

            const intro = mudos.length
                ? `⚠️ *${mudos.length} grupo(s) com todos os módulos desligados*: não respondo a nada neles.`
                : '✅ Todos os grupos têm módulos ligados.'

            const topo = [
                soMudos ? '🔎 _Mostrando só os grupos onde não respondo._' : '',
                `📄 *Página ${p} de ${totalPaginas}*`
            ].filter(Boolean).join('\n')

            const base = (p - 1) * POR_PAGINA
            const blocos = fatia.map((a, i) => {
                const g = a.g
                const sinal = a.modulos === 0 ? '🔴' : (a.modulos < 5 ? '🟡' : '🟢')
                const linhas = [
                    `${sinal} *${base + i + 1}. ${g.subject || 'sem nome'}*`,
                    F.campo('Código', '`' + g.id + '`'),
                    F.campo('Membros', `${g.participants?.length || 0} • sou administrador: ${a.botAdmin ? 'sim' : 'não'}`),
                    F.campo('Módulos ligados', a.modulos === 0 ? '0 (não respondo aqui)' : a.modulos),
                    F.campo('Perfil', a.perfil ? `${a.perfil.emoji} ${a.perfil.label}` : 'nenhum')
                ]
                if (a.modoAluguel) {
                    linhas.push(F.campo('Aluguel', a.aluguel ? (a.aluguel.isLifetime ? '♾️ vitalício' : a.aluguel.remainingText) : '❌ sem acesso'))
                }
                return linhas.join('\n')
            })

            return reply(F.tela({
                prefix,
                emoji: '📋',
                titulo: `Grupos onde estou (${lista.length})`,
                intro,
                secoes: [
                    topo,
                    blocos.length ? blocos.join('\n\n') : '_Nenhum grupo nesta seleção._'
                ],
                proximos: [
                    mudos.length && !soMudos ? { nome: 'grupos', args: 'mudos', oque: 'ver só os grupos onde não respondo' } : null,
                    mudos.length ? { nome: 'perfilbot', args: 'goat <código>', oque: 'ligar os módulos padrão num grupo' } : null,
                    p < totalPaginas ? { nome: 'grupos', args: `${soMudos ? 'mudos ' : ''}${p + 1}`, oque: 'próxima página' } : null,
                    { nome: 'auditoria', oque: 'diagnóstico completo' }
                ].filter(Boolean)
            }))
        } catch (err) {
            logger.error('[GRUPOS ERROR]', err)
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui listar os grupos',
                intro: 'O WhatsApp não me devolveu a lista agora. Tente de novo em instantes.',
                dica: 'O motivo detalhado ficou no log do dia.',
                proximos: [{ nome: 'grupos', oque: 'tentar de novo' }]
            }))
        }
    }
}
