/**
 * Comando .reativar — troca créditos por dias de aluguel do grupo.
 *
 * A ordem importa: só gastamos o crédito DEPOIS que o aluguel foi estendido
 * com sucesso. Se debitássemos antes e o addRentalTime falhasse, o crédito
 * pago com dinheiro real sumiria sem nada em troca. Se ainda assim a extensão
 * falhar após o débito, estornamos.
 */

const creditos = require('../../services/payments/creditsService')
const rentalService = require('../../services/rentalService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Nome legível de cada modalidade. */
const NOME_ESCOPO = { group: 'grupo', pv: 'privado', combo: 'grupo + privado' }

module.exports = {
    name: 'reativar',
    aliases: ['renovaraluguel', 'usarcreditos', 'ativaraluguel'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Usa seus créditos para renovar o aluguel do grupo, do privado ou dos dois',
    usage: '[pv | grupo | combo] <dias>',
    examples: [
        '30 — renova por 30 dias onde você está',
        'pv 7 — renova seu privado por 7 dias',
        'combo 30 — renova grupo e privado juntos (custa 1,5x)'
    ],
    groupOnly: false,
    cooldownMs: 5000,
    execute: async ({ sender, from, isGroup, args, reply, pushName, prefix = '.' }) => {
        const saldo = creditos.saldo(sender)
        const custoDia = creditos.CREDITOS_POR_DIA
        const diasDisponiveis = creditos.creditosParaDias(saldo)

        let targetScope = isGroup ? 'group' : 'pv'
        let targetJid = isGroup ? from : sender
        let targetName = isGroup ? 'este grupo' : 'seu privado'

        let daysArg = args[0]
        const first = (args[0] || '').toLowerCase()

        if (['pv', 'dm', 'privado'].includes(first)) {
            targetScope = 'pv'
            targetJid = sender
            targetName = 'seu privado'
            daysArg = args[1]
        } else if (['grupo', 'group'].includes(first)) {
            targetScope = 'group'
            targetJid = isGroup ? from : (args[2] || from)
            targetName = 'o grupo'
            daysArg = args[1]
        } else if (['combo', 'ambos'].includes(first)) {
            targetScope = 'combo'
            daysArg = args[1]
        }

        // Combo fora de grupo só teria o privado para estender, mas cobraria
        // 1,5x. Em vez de cobrar pela metade que não existe, recuso e mostro
        // o caminho certo.
        if (targetScope === 'combo' && !isGroup) {
            return reply(F.tela({
                prefix,
                emoji: '👥',
                titulo: 'Combo só dentro do grupo',
                intro: 'O combo renova o grupo e o seu privado juntos, então preciso que você mande o comando dentro do grupo que quer renovar.',
                proximos: [
                    { nome: 'reativar', args: 'pv <dias>', oque: 'renovar só o seu privado daqui mesmo' },
                    { nome: 'reativar', args: 'combo <dias>', oque: 'dentro do grupo, renova os dois' }
                ]
            }))
        }

        const pedido = parseInt(daysArg, 10)

        if (!Number.isInteger(pedido) || pedido <= 0) {
            const currentInfo = rentalService.getRentalInfo(targetJid)
            const prazoAtual = currentInfo?.expiresAt
                ? F.campo(`Prazo atual (${targetName})`, rentalService.formatTimeRemaining(currentInfo.expiresAt - Date.now()))
                : F.campo(`Prazo atual (${targetName})`, 'sem aluguel ativo')
            const pedidoInvalido = daysArg !== undefined && daysArg !== ''

            return reply(F.tela({
                prefix,
                emoji: '🔄',
                titulo: 'Renovar aluguel com créditos',
                intro: pedidoInvalido
                    ? `"${daysArg}" não é uma quantidade de dias. Use um número inteiro maior que zero.`
                    : (diasDisponiveis > 0
                        ? `Seus créditos pagam até *${diasDisponiveis} dia(s)* de aluguel. Diga quantos dias quer renovar.`
                        : 'Você ainda não tem créditos suficientes para renovar. Compre créditos e volte aqui.'),
                secoes: [
                    {
                        emoji: '💰', titulo: 'Sua carteira', linhas: [
                            F.campo('Créditos', saldo),
                            F.campo('Custo', `${custoDia} créditos por dia (combo: 1,5x)`),
                            F.campo('Dá para', `${diasDisponiveis} dia(s)`),
                            prazoAtual
                        ]
                    },
                    diasDisponiveis > 0 ? {
                        emoji: '✍️', titulo: 'Digite assim', linhas: [
                            `• ${F.cmd(prefix, 'reativar', '<dias>')} — renova onde você está (${isGroup ? 'grupo' : 'privado'})`,
                            `• ${F.cmd(prefix, 'reativar', 'pv <dias>')} — renova seu privado`,
                            `• ${F.cmd(prefix, 'reativar', 'grupo <dias>')} — renova o grupo`,
                            `• ${F.cmd(prefix, 'reativar', 'combo <dias>')} — renova grupo e privado`
                        ]
                    } : null
                ],
                proximos: diasDisponiveis > 0
                    ? [{ nome: 'reativar', args: String(Math.min(30, diasDisponiveis)), oque: `renovar ${Math.min(30, diasDisponiveis)} dia(s) aqui` }]
                    : [
                        { nome: 'assinar', oque: 'ver os planos e comprar créditos' },
                        { nome: 'creditos', oque: 'ver sua carteira' }
                    ]
            }))
        }

        // Quem é vitalício não precisa renovar: recuso antes de tocar nos créditos.
        const alvos = targetScope === 'combo'
            ? [{ jid: sender, tipo: 'pv' }, { jid: from, tipo: 'group' }]
            : [{ jid: targetJid, tipo: targetScope }]
        const vitalicio = alvos.find(a => rentalService.getRentalInfo(a.jid)?.isLifetime)
        if (vitalicio) {
            return reply(F.tela({
                prefix,
                emoji: '♾️',
                titulo: 'Esse aluguel já é vitalício',
                intro: `${vitalicio.tipo === 'pv' ? 'Seu privado' : 'Este grupo'} já está liberado para sempre, então não gastei nenhum crédito.`,
                proximos: [
                    { nome: 'aluguel', oque: 'ver a situação do aluguel' },
                    { nome: 'creditos', oque: 'ver sua carteira' }
                ]
            }))
        }

        const custoTotal = targetScope === 'combo' ? (pedido * custoDia * 1.5) : (pedido * custoDia)
        const custoFinal = Math.ceil(custoTotal)

        if (saldo < custoFinal) {
            const diasQueCabem = targetScope === 'combo' ? Math.floor(diasDisponiveis / 1.5) : diasDisponiveis
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Créditos insuficientes',
                intro: `Renovar ${pedido} dia(s) custa *${custoFinal} créditos* e você tem *${saldo}*.`,
                secoes: [{
                    emoji: '📋', titulo: 'Pedido', linhas: [
                        F.campo('Onde', NOME_ESCOPO[targetScope] || targetScope),
                        F.campo('Dias', pedido),
                        F.campo('Custo', `${custoFinal} créditos`),
                        F.campo('Seu saldo dá para', `${diasDisponiveis} dia(s)`)
                    ]
                }],
                proximos: [
                    diasQueCabem > 0 ? { nome: 'reativar', args: `${targetScope === 'combo' ? 'combo ' : ''}${diasQueCabem}`, oque: 'renovar o que seus créditos pagam' } : null,
                    { nome: 'assinar', oque: 'comprar mais créditos' }
                ].filter(Boolean)
            }))
        }

        // Foto de cada alvo antes de mexer: é ela que permite desfazer de verdade.
        const fotos = alvos.map(a => ({ ...a, antes: rentalService.snapshotRental(a.jid) }))
        const desfazer = (motivo) => {
            for (const f of fotos) {
                try {
                    if (!rentalService.restoreRental(f.jid, f.antes)) {
                        logger.error(`[REATIVAR] Reversão de ${f.jid} recusada pelo banco (${motivo})`)
                    }
                } catch (e) {
                    logger.error(`[REATIVAR] Reversão de ${f.jid} falhou (${motivo}): ${e.message}`)
                }
            }
        }

        // 1. Estende primeiro
        try {
            for (const a of alvos) {
                rentalService.addRentalTime(a.jid, `${pedido}d`, pushName || sender, a.tipo)
            }
        } catch (e) {
            logger.error(`[REATIVAR] Falha ao estender aluguel de ${targetJid}: ${e.message}`)
            desfazer('extensão incompleta')
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui renovar',
                intro: 'Algo falhou ao estender o prazo. *Nenhum crédito foi gasto.*',
                dica: 'Tente de novo em instantes. Se continuar, avise um dos meus donos.',
                proximos: [{ nome: 'dono', oque: 'falar com os donos' }]
            }))
        }

        // 2. Cobra créditos
        const g = creditos.gastar({
            jid: sender,
            creditos: custoFinal,
            motivo: `aluguel ${targetScope} +${pedido}d em ${targetJid}`
        })

        if (!g.ok) {
            logger.warn(`[REATIVAR] Débito falhou após estender ${targetJid}; revertendo`)
            desfazer('débito recusado')
            logger.warn(`[REATIVAR] Motivo do débito recusado para ${sender}: ${g.erro}`)
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui descontar os créditos',
                intro: 'O desconto dos créditos não passou, então a renovação foi desfeita.',
                proximos: [
                    { nome: 'creditos', oque: 'conferir seu saldo' },
                    { nome: 'dono', oque: 'falar com os donos se o saldo estiver errado' }
                ]
            }))
        }

        const infoAtualizada = rentalService.getRentalInfo(targetScope === 'combo' ? from : targetJid)
        const expira = infoAtualizada?.expiresAt || 0
        const restante = expira ? expira - Date.now() : 0

        logger.info(`[REATIVAR] ${sender} usou ${custoFinal} créditos para +${pedido}d em ${targetJid} (${targetScope})`)

        return reply(F.tela({
            prefix,
            emoji: '✅',
            titulo: 'Aluguel renovado',
            intro: `Adicionei *${pedido} dia(s)* e usei *${custoFinal} créditos*. Obrigado por me manter por aqui!`,
            secoes: [{
                emoji: '📋', titulo: 'Detalhes', linhas: [
                    F.campo('Onde', NOME_ESCOPO[targetScope] || targetScope),
                    F.campo('Tempo adicionado', `+${pedido} dia(s)`),
                    F.campo('Créditos usados', custoFinal),
                    F.campo('Saldo restante', `${g.saldo} créditos`),
                    F.campo('Novo prazo', rentalService.formatTimeRemaining(restante))
                ]
            }],
            proximos: [
                { nome: 'aluguel', oque: 'ver a situação do aluguel' },
                { nome: 'creditos', oque: 'ver sua carteira' }
            ]
        }))
    }
}
