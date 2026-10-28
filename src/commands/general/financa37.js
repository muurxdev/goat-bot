/**
 * Comando .compararfinanciamento — PRICE x SAC
 *
 * Compara os dois sistemas de amortização lado a lado.
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
    name: 'compararfinanciamento',
    aliases: ["pricexsac"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Compara os dois sistemas de amortização lado a lado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = F.lerNumero(args[0])
    const taxa = F.lerNumero(args[1])
    const meses = F.lerNumero(args[2])
    if (!Number.isFinite(valor) || !Number.isFinite(taxa) || !Number.isFinite(meses) || meses < 1) {
        return reply('⚖️ 📌 Uso: `' + prefix + 'compararfinanciamento 200000 0,8 360`')
    }
    const p = F.price({ valor, taxaMensal: taxa, meses })
    const s = F.sac({ valor, taxaMensal: taxa, meses })
    let doc = cab('PRICE x SAC', '⚖️')
    doc += linha('Financiado', F.moeda(valor))
    doc += linha('Taxa', F.pct(taxa) + ' ao mês')
    doc += linha('Prazo', meses + ' meses')
    doc += sep()
    doc += bloco('🏠 PRICE (parcela fixa)', [
        'Parcela: ' + F.moeda(p.parcela),
        'Total: ' + F.moeda(p.totalPago),
        'Juros: ' + F.moeda(p.juros)
    ])
    doc += bloco('🏗️ SAC (parcela decrescente)', [
        'Primeira: ' + F.moeda(s.primeira),
        'Última: ' + F.moeda(s.ultima),
        'Total: ' + F.moeda(s.totalPago),
        'Juros: ' + F.moeda(s.juros)
    ])
    const economia = p.totalPago - s.totalPago
    doc += '\n💡 *O veredito*\n'
    doc += 'O SAC custa ' + F.moeda(Math.abs(economia)) + ' a ' + (economia > 0 ? 'menos' : 'mais') + ' no total, '
    doc += 'mas exige ' + F.moeda(s.primeira - p.parcela) + ' a mais na primeira parcela.\n\n'
    doc += '_Quem tem folga no orçamento hoje paga menos juros no SAC. Quem está no limite da renda cabe melhor na Price._'
    return reply(doc)
    }
}
