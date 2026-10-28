/**
 * Comando .falhas
 * Mostra os comandos que mais falharam e as falhas mais recentes, a partir de
 * command_analytics (persistido: sobrevive a restart, ao contrário do .metrics).
 *
 *   .falhas       → 5 de cada lista
 *   .falhas 10    → até 15 de cada lista
 *
 * O erro aparece entre crases: é conteúdo técnico para o dono, e o tradutor
 * do Reino preserva trechos em crase.
 */

const analyticsRepo = require('../../database/repositories/analyticsRepository')
const F = require('../../utils/formato')

const MAX_ERRO_EXIBIDO = 140
const LIMITE_PADRAO = 5
const LIMITE_MAXIMO = 15

function haQuantoTempo(ms, agora = Date.now()) {
    if (!ms) return 'em data desconhecida'
    const seg = Math.max(0, Math.floor((agora - Number(ms)) / 1000))
    if (seg < 60) return 'há poucos segundos'
    const min = Math.floor(seg / 60)
    if (min < 60) return `há ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `há ${h} h`
    const dias = Math.floor(h / 24)
    return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
}

function erroCurto(texto) {
    const limpo = String(texto || 'sem mensagem').replace(/`/g, "'").replace(/\s+/g, ' ').trim()
    return limpo.length > MAX_ERRO_EXIBIDO ? limpo.slice(0, MAX_ERRO_EXIBIDO - 1) + '…' : limpo
}

function plural(n, um, varios) {
    return `${n} ${n === 1 ? um : varios}`
}

function montarRelatorio({ top, recentes, total, agora = Date.now(), prefix = '.' }) {
    if (!top.length) {
        return F.tela({
            prefix,
            emoji: '🩺',
            titulo: 'Nenhuma falha registrada',
            intro: 'Nenhum comando falhou desde que comecei a anotar. Quando algum falhar, ele aparece aqui com o erro resumido e há quanto tempo foi.',
            dica: 'As falhas ficam guardadas mesmo depois de eu reiniciar.',
            proximos: [
                { nome: 'autofix', oque: 'fazer uma checagem geral' },
                { nome: 'auditoria', oque: 'ver grupos, aluguel e serviços' }
            ]
        })
    }

    let doc = `🩺 Estas são as falhas de comando que registrei.\n`
    doc += `Somando tudo, foram ${plural(total, 'falha', 'falhas')}.\n\n`

    doc += `*Os que mais falharam*\n`
    top.forEach((r, i) => {
        const taxa = r.execution_count > 0 ? `, ${r.execution_count} execuções sem erro` : ''
        doc += `${i + 1}. \`${prefix}${r.command_name}\` com ${plural(r.error_count, 'falha', 'falhas')}${taxa}. A última foi ${haQuantoTempo(r.last_error_at, agora)}.\n`
        doc += `   \`${erroCurto(r.last_error)}\`\n`
    })

    doc += `\n*As mais recentes*\n`
    recentes.forEach((r, i) => {
        doc += `${i + 1}. \`${prefix}${r.command_name}\` ${haQuantoTempo(r.last_error_at, agora)} (${plural(r.error_count, 'falha', 'falhas')} no total)\n`
        doc += `   \`${erroCurto(r.last_error)}\`\n`
    })

    doc += `\nO erro completo, com os detalhes, fica no arquivo de log do dia.`
    return doc.trim()
}

module.exports = {
    name: 'falhas',
    category: 'owner',
    subcategory: 'Infraestrutura',
    description: 'Mostra os comandos que mais falharam e as falhas mais recentes',
    usage: '[quantidade até 15]',
    examples: [
        ' — os 5 comandos que mais falharam e as 5 falhas mais recentes',
        '10 — mostra até 10 de cada lista'
    ],
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const pedido = parseInt(args[0], 10)
        const limite = Number.isFinite(pedido) && pedido > 0 ? Math.min(pedido, LIMITE_MAXIMO) : LIMITE_PADRAO

        const top = analyticsRepo.getTopFailures(limite)
        const recentes = analyticsRepo.getRecentFailures(limite)
        const total = analyticsRepo.getTotalFailures()

        return reply(montarRelatorio({ top, recentes, total, prefix }))
    }
}
