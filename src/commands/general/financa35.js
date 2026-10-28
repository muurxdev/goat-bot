/**
 * Comando .financiamentoprice — FINANCIAMENTO PRICE
 *
 * Parcela fixa: calcula prestação e total pago.
 */

const F = require('../../services/financeService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}


module.exports = {
    name: 'financiamentoprice',
    aliases: ["tabelaprice"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Parcela fixa: calcula prestação e total pago',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = F.lerNumero(args[0])
    const taxa = F.lerNumero(args[1])
    const meses = F.lerNumero(args[2])
    if (!Number.isFinite(valor) || !Number.isFinite(taxa) || !Number.isFinite(meses) || meses < 1) {
        let doc = cab('FINANCIAMENTO PRICE', '🏠')
        doc += '📌 Uso: `' + prefix + 'financiamentoprice <valor> <taxa % ao mês> <meses>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'financiamentoprice 200000 0,8 360`\n\n'
        doc += '_Na Price a parcela não muda do começo ao fim._'
        return reply(doc)
    }
    const r = F.price({ valor, taxaMensal: taxa, meses })
    let doc = cab('FINANCIAMENTO PRICE', '🏠')
    doc += linha('Financiado', F.moeda(r.valor))
    doc += linha('Taxa', F.pct(taxa) + ' ao mês')
    doc += linha('Prazo', r.meses + ' meses')
    doc += sep()
    doc += bloco('💳 RESULTADO', [
        'Parcela fixa: *' + F.moeda(r.parcela) + '*',
        'Total pago: ' + F.moeda(r.totalPago),
        'Só de juros: ' + F.moeda(r.juros),
        'Você paga ' + (r.totalPago / r.valor).toFixed(2).replace('.', ',') + 'x o valor do bem'
    ])
    doc += '\n📊 *Quanto do total é juro*\n' + barra(r.juros / r.totalPago) + '\n\n'
    doc += '⚖️ _Comparar com SAC:_ `' + prefix + 'compararfinanciamento ' + valor + ' ' + taxa + ' ' + meses + '`'
    return reply(doc)
    }
}
