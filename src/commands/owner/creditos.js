/**
 * Comando .creditos — carteira de créditos do aluguel (dinheiro real).
 *
 * Não confundir com as moedas do RPG: crédito aqui foi pago de verdade. Por
 * isso vive em outra estrutura e nenhum comando de cassino ou `.roubar`
 * consegue encostar nele.
 *
 * `.creditos`             — seu saldo e extrato
 * `.creditos ajustar @x N` — (dono) estorno, cortesia ou correção
 * `.creditos todos`        — (dono) lista quem tem saldo
 */

const creditos = require('../../services/payments/creditsService')
const F = require('../../utils/formato')

function dataCurta(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    })
}

const reais = c => (Number(c) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

module.exports = {
    name: 'creditos',
    aliases: ['meuscreditos', 'carteiraaluguel', 'saldocreditos'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Mostra seus créditos de aluguel e o extrato',
    usage: '[todos | ajustar @pessoa <quantidade>]',
    examples: [
        ' — seu saldo de créditos e os últimos movimentos',
        'todos — (dono) quem tem créditos e o total arrecadado',
        'ajustar @fulano 50 — (dono) dá 50 créditos; use negativo para tirar'
    ],
    cooldownMs: 3000,
    execute: async ({ sender, info, args, reply, isOwner, prefix = '.' }) => {
        const acao = (args[0] || '').toLowerCase()
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

        // ── Ajuste manual (só o dono): estorno, cortesia, correção.
        if (acao === 'ajustar') {
            if (!isOwner) return reply('🔒 *Só meus donos podem ajustar créditos.*\n\nPara ver o seu saldo, use `' + prefix + 'creditos`.')
            const valor = parseInt(args.find(a => /^-?\d+$/.test(a)), 10)
            if (!mencionado || !Number.isInteger(valor)) {
                return reply(F.tela({
                    prefix,
                    emoji: '🛠️',
                    titulo: 'Ajustar créditos',
                    intro: 'Serve para estorno, cortesia ou correção. Marque a pessoa e diga quantos créditos dar ou tirar.',
                    secoes: [{
                        emoji: '✍️', titulo: 'Digite assim', linhas: [
                            `• ${F.cmd(prefix, 'creditos', 'ajustar @fulano 50')} — dá 50 créditos`,
                            `• ${F.cmd(prefix, 'creditos', 'ajustar @fulano -50')} — tira 50 créditos`
                        ]
                    }],
                    dica: `Cada ${creditos.CREDITOS_POR_DIA} créditos valem 1 dia de aluguel.`,
                    proximos: [{ nome: 'creditos', args: 'todos', oque: 'ver quem tem créditos' }]
                }))
            }
            const r = creditos.ajustar({ jid: mencionado, creditos: valor, motivo: `ajuste por ${sender}` })
            return reply(F.tela({
                prefix,
                emoji: '✅',
                titulo: 'Créditos ajustados',
                intro: `${valor >= 0 ? 'Dei' : 'Tirei'} *${Math.abs(valor)}* créditos ${valor >= 0 ? 'para' : 'de'} @${mencionado.split('@')[0]}.`,
                secoes: [{ emoji: '💰', titulo: 'Saldo', linhas: [F.campo('Novo saldo', `${r.saldo} créditos`)] }],
                proximos: [{ nome: 'creditos', args: 'todos', oque: 'ver todas as carteiras' }]
            }), [mencionado])
        }

        // ── Panorama de todos (só o dono).
        if (acao === 'todos' || acao === 'listar') {
            if (!isOwner) return reply('🔒 *Só meus donos podem ver a lista completa.*\n\nPara ver o seu saldo, use `' + prefix + 'creditos`.')
            const perfis = creditos.todosOsPerfis().filter(p => p.creditos > 0 || p.totalPago > 0)
            if (!perfis.length) {
                return reply(F.tela({
                    prefix,
                    emoji: '📭',
                    titulo: 'Ninguém tem créditos ainda',
                    intro: 'Quando alguém pagar um plano ou receber um ajuste, aparece aqui com o saldo e quanto já pagou.',
                    proximos: [
                        { nome: 'assinar', oque: 'ver os planos e gerar pagamento' },
                        { nome: 'creditos', args: 'ajustar @fulano 50', oque: 'dar créditos de cortesia' }
                    ]
                }))
            }

            let totalPago = 0
            const linhas = []
            for (const p of perfis.slice(0, 25)) {
                totalPago += Number(p.totalPago || 0)
                linhas.push(`• @${p.jid.split('@')[0]}: ${p.creditos} créditos • ${reais(p.totalPago || 0)} pagos`)
            }
            if (perfis.length > 25) linhas.push(`_...e mais ${perfis.length - 25}._`)
            const doc = F.tela({
                prefix,
                emoji: '💳',
                titulo: `Carteiras de aluguel (${perfis.length})`,
                intro: `Total arrecadado: *${reais(totalPago)}*${perfis.length > 25 ? ' (entre os 25 listados)' : ''}.`,
                secoes: [{ emoji: '👥', titulo: 'Quem tem créditos', linhas }],
                proximos: [{ nome: 'creditos', args: 'ajustar @fulano 50', oque: 'corrigir um saldo' }]
            })
            return reply(doc, perfis.slice(0, 25).map(p => p.jid))
        }

        // ── Saldo próprio (ou de alguém, se o dono marcar).
        const alvo = (isOwner && mencionado) ? mencionado : sender
        const p = creditos.perfil(alvo)
        const dias = creditos.creditosParaDias(p.creditos)

        const ext = creditos.extrato(alvo, 5)
        const movimentos = ext.map(m => {
            const sinal = m.creditos >= 0 ? '+' : ''
            const rotulo = m.tipo === 'compra' ? '💵 Compra'
                : m.tipo === 'gasto' ? '🔄 ' + (m.motivo || 'uso')
                    : '🛠️ ' + (m.motivo || 'ajuste')
            return `${rotulo}: *${sinal}${m.creditos}* _(${dataCurta(m.em)})_`
        })

        const doc = F.tela({
            prefix,
            emoji: '💳',
            titulo: alvo !== sender ? 'Carteira de aluguel' : 'Sua carteira de aluguel',
            intro: (alvo !== sender ? `@${alvo.split('@')[0]} tem` : 'Você tem') + ` *${p.creditos} créditos*, o suficiente para *${dias} dia(s)* de aluguel.`,
            secoes: [
                {
                    emoji: '💰', titulo: 'Resumo', linhas: [
                        F.campo('Créditos', p.creditos),
                        F.campo('Equivale a', `${dias} dia(s) de aluguel`),
                        p.totalPago > 0 ? F.campo('Total pago', reais(p.totalPago)) : null,
                        p.totalPago > 0 ? F.campo('Última compra', dataCurta(p.ultimaCompra)) : null
                    ]
                },
                { emoji: '📜', titulo: 'Últimos movimentos', linhas: movimentos }
            ],
            dica: ext.length ? '' : 'Ainda não há movimentos. Créditos entram quando um pagamento é confirmado.',
            proximos: [
                { nome: 'assinar', oque: 'comprar créditos' },
                dias > 0 ? { nome: 'reativar', args: String(Math.min(30, dias)), oque: 'usar créditos para renovar o aluguel' } : null
            ].filter(Boolean)
        })
        return reply(doc, alvo !== sender ? [alvo] : [])
    }
}
