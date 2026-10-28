/**
 * Comando .financiamentosac — FINANCIAMENTO SAC
 *
 * Parcela decrescente: calcula primeira, última e total.
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
    name: 'financiamentosac',
    aliases: ["tabelasac"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Parcela decrescente: calcula primeira, última e total',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = F.lerNumero(args[0])
    const taxa = F.lerNumero(args[1])
    const meses = F.lerNumero(args[2])
    if (!Number.isFinite(valor) || !Number.isFinite(taxa) || !Number.isFinite(meses) || meses < 1) {
        let doc = cab('FINANCIAMENTO SAC', '🏗️')
        doc += '📌 Uso: `' + prefix + 'financiamentosac <valor> <taxa % ao mês> <meses>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'financiamentosac 200000 0,8 360`\n\n'
        doc += '_No SAC a amortização é constante e a parcela cai todo mês._'
        return reply(doc)
    }
    const r = F.sac({ valor, taxaMensal: taxa, meses })
    let doc = cab('FINANCIAMENTO SAC', '🏗️')
    doc += linha('Financiado', F.moeda(r.valor))
    doc += linha('Taxa', F.pct(taxa) + ' ao mês')
    doc += linha('Prazo', r.meses + ' meses')
    doc += sep()
    doc += bloco('💳 RESULTADO', [
        'Primeira parcela: *' + F.moeda(r.primeira) + '*',
        'Última parcela: ' + F.moeda(r.ultima),
        'Amortização fixa: ' + F.moeda(r.amortizacao) + '/mês',
        'Total pago: ' + F.moeda(r.totalPago),
        'Só de juros: ' + F.moeda(r.juros)
    ])
    doc += '\n📊 *Quanto do total é juro*\n' + barra(r.juros / r.totalPago) + '\n\n'
    doc += '⚠️ _A primeira parcela é a mais alta: é ela que o banco usa para aprovar a renda._\n'
    doc += '⚖️ _Comparar com Price:_ `' + prefix + 'compararfinanciamento ' + valor + ' ' + taxa + ' ' + meses + '`'
    return reply(doc)
    }
}
