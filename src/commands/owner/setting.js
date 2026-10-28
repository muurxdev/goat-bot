/**
 * Comando .setting — lê e altera configurações COM ESCOPO.
 *
 *   .setting                      → tudo que vale neste ambiente
 *   .setting prefix               → valor e de onde ele vem
 *   .setting prefix 7             → define AQUI (neste grupo ou neste PV)
 *   .setting prefix ! global      → define para todos os ambientes
 *   .setting prefix reset         → volta a herdar
 *
 * Cada ajuste vale só onde foi feito: prefixo 7 num grupo não vaza para os
 * outros nem para o privado.
 */

const settings = require('../../services/settingsService')
const { SETTINGS } = require('../../config/settings')
const { resolveGroupName } = require('../../utils/groupLabel')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Como o valor aparece na tela. */
function mostrar(valor, tipo) {
    if (tipo === 'bool') return valor ? '🟢 ligado' : '🔴 desligado'
    if (valor === '' || valor === null || valor === undefined) return '_(vazio)_'
    return `\`${valor}\``
}

const SELO_ORIGEM = {
    ambiente: '📍 definido aqui',
    global: '🌐 herdado do global',
    padrao: '⚙️ padrão'
}

module.exports = {
    name: 'setting',
    // 'configurar' pertence ao comando config, que veio antes — perdê-lo em
    // silêncio seria pior do que não pedir.
    aliases: ['settings', 'ajuste', 'ajustes', 'setconfig'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Mostra e muda meus ajustes só neste grupo, no privado ou em todo lugar',
    usage: '[ajuste] [valor | reset] [global]',
    examples: [
        ' — lista os ajustes que valem aqui',
        'prefix — mostra o prefixo e de onde ele vem',
        'prefix 7 — muda o prefixo só neste grupo',
        'reacoes off global — desliga as reações em todo lugar'
    ],
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup, sender }) => {
        // No privado o escopo é a PESSOA, não o bot: cada um tem o seu ajuste.
        const escopoAtual = isGroup ? from : sender
        const nome = await resolveGroupName(escopoAtual, 'SETTING')
        const ondeTxt = isGroup ? (nome ? `👥 *${nome}*` : '👥 este grupo') : '💬 seu privado'

        try {
            // ── Lista completa ────────────────────────────────────────
            if (!args.length) {
                const lista = settings.list(escopoAtual)
                const proprios = lista.filter(s => s.origem === 'ambiente')
                const herdados = lista.filter(s => s.origem !== 'ambiente')

                return reply(F.tela({
                    emoji: '⚙️',
                    titulo: 'Configurações',
                    intro: proprios.length
                        ? `${proprios.length} ajuste(s) feitos só aqui; o resto vem do global ou do padrão.`
                        : 'Nada foi ajustado só aqui: tudo vem do global ou do padrão.',
                    secoes: [
                        { emoji: '📍', titulo: 'Ambiente', linhas: [F.campo('Onde', ondeTxt)] },
                        proprios.length ? {
                            emoji: '✏️',
                            titulo: `Definidos aqui (${proprios.length})`,
                            linhas: proprios.map(s => `• *${s.label}* (${s.chave}) — ${mostrar(s.valor, s.tipo)}`)
                        } : null,
                        {
                            emoji: '🌐',
                            titulo: `Herdados (${herdados.length})`,
                            linhas: herdados.map(s => `• *${s.label}* (${s.chave}) — ${mostrar(s.valor, s.tipo)}`)
                        }
                    ],
                    dica: `Use o nome entre parênteses. Ex.: ${F.cmd(prefix, 'setting', 'prefix 7')} deixa o prefixo 7 só aqui.`,
                    proximos: [
                        { nome: 'setting', args: '<ajuste>', oque: 'vê detalhes de um ajuste' },
                        { nome: 'setting', args: '<ajuste> <valor> global', oque: 'muda para todos os ambientes' },
                        { nome: 'setting', args: '<ajuste> reset', oque: 'volta a herdar' }
                    ],
                    prefix
                }))
            }

            const chave = args[0]
            const valorBruto = args[1]
            const alvoGlobal = ['global', 'geral', 'tudo'].includes((args[2] || '').toLowerCase())
            const escopoAlvo = alvoGlobal ? null : escopoAtual

            // ── Detalhe de uma configuração ───────────────────────────
            if (!valorBruto) {
                const r = settings.get(chave, escopoAtual)
                if (!r.setting) {
                    return reply(F.tela({
                        emoji: '🔎',
                        titulo: 'Ajuste não encontrado',
                        intro: `Não tenho nenhum ajuste chamado *${chave}*.`,
                        secoes: [{
                            emoji: '📋',
                            titulo: 'Ajustes que existem',
                            linhas: [SETTINGS.map(s => s.chave).join(', ')]
                        }],
                        proximos: [{ nome: 'setting', oque: 'lista os ajustes com os valores atuais' }],
                        prefix
                    }))
                }
                return reply(F.tela({
                    emoji: '⚙️',
                    titulo: r.setting.label,
                    intro: r.setting.descricao,
                    secoes: [{
                        emoji: '📊',
                        titulo: 'Situação',
                        linhas: [
                            F.campo('Valor', mostrar(r.valor, r.setting.tipo)),
                            F.campo('De onde vem', SELO_ORIGEM[r.origem]),
                            F.campo('Ambiente', ondeTxt),
                            F.campo('Pode ser ajustado em', r.setting.escopos.map(e => e === 'pv' ? 'privado' : e).join(', '))
                        ]
                    }],
                    proximos: [
                        { nome: 'setting', args: `${r.setting.chave} <valor>`, oque: 'muda só aqui' },
                        { nome: 'setting', args: `${r.setting.chave} <valor> global`, oque: 'muda em todo lugar' },
                        r.origem === 'ambiente' ? { nome: 'setting', args: `${r.setting.chave} reset`, oque: 'volta a herdar' } : null
                    ].filter(Boolean),
                    prefix
                }))
            }

            // ── Reset ─────────────────────────────────────────────────
            if (['reset', 'limpar', 'herdar', 'padrao', 'padrão'].includes(String(valorBruto).toLowerCase())) {
                const r = await settings.reset(chave, escopoAlvo)
                if (!r.ok) {
                    return reply(F.tela({
                        emoji: '⚠️',
                        titulo: 'Nada para remover',
                        intro: r.motivo,
                        proximos: [{ nome: 'setting', args: chave, oque: 'vê de onde vem o valor atual' }],
                        prefix
                    }))
                }
                const depois = settings.get(chave, escopoAtual)
                return reply(F.tela({
                    emoji: '♻️',
                    titulo: 'Ajuste removido',
                    intro: `Tirei o ajuste de ${alvoGlobal ? '🌐 global' : ondeTxt}.`,
                    secoes: [{
                        emoji: '📊',
                        titulo: 'Valor agora',
                        linhas: [
                            F.campo('Valor', mostrar(depois.valor, depois.setting.tipo)),
                            F.campo('De onde vem', SELO_ORIGEM[depois.origem])
                        ]
                    }],
                    prefix
                }))
            }

            // ── Definir ───────────────────────────────────────────────
            const r = await settings.set(chave, valorBruto, escopoAlvo)
            if (!r.ok) {
                return reply(F.tela({
                    emoji: '❌',
                    titulo: 'Não mudei o ajuste',
                    intro: r.motivo,
                    proximos: [
                        { nome: 'setting', args: chave, oque: 'vê o ajuste e onde ele vale' },
                        { nome: 'setting', oque: 'lista todos os ajustes' }
                    ],
                    prefix
                }))
            }

            const s = settings.get(chave, escopoAtual)
            logger.info(`[SETTING] ${sender} definiu "${chave}" em ${escopoAlvo || 'global'}`)
            return reply(F.tela({
                emoji: '✅',
                titulo: `${s.setting.label} atualizado`,
                intro: alvoGlobal
                    ? 'Vale para todos os ambientes. Quem tem ajuste próprio continua com o dele.'
                    : 'Vale só aqui. Os outros ambientes não mudaram.',
                secoes: [{
                    emoji: '📊',
                    titulo: 'Resultado',
                    linhas: [
                        F.campo('Valor', mostrar(r.valor, s.setting.tipo)),
                        F.campo('Onde vale', alvoGlobal ? '🌐 todos os ambientes' : ondeTxt)
                    ]
                }],
                proximos: [{ nome: 'setting', args: `${s.setting.chave} reset${alvoGlobal ? ' global' : ''}`, oque: 'desfaz' }],
                prefix
            }))
        } catch (err) {
            logger.error('[SETTING ERROR]', err)
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não consegui abrir as configurações',
                intro: 'Algo falhou ao ler ou salvar os ajustes, então nada mudou. Tente de novo em instantes; se repetir, confira os registros do servidor.',
                proximos: [{ nome: 'setting', oque: 'tenta de novo' }],
                prefix
            }))
        }
    }
}
