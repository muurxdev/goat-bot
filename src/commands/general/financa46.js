/**
 * Comando .calculadorasfinanceiras — CALCULADORAS FINANCEIRAS
 *
 * Índice de todas as calculadoras de dinheiro.
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
    name: 'calculadorasfinanceiras',
    aliases: ["menufinancas"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Índice de todas as calculadoras de dinheiro',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CALCULADORAS FINANCEIRAS', '🧰')
    doc += bloco('📈 CRESCER', [
        '`' + prefix + 'jurocomposto 5000 0,9 120 300` — simular investimento',
        '`' + prefix + 'tempoobjetivo 100000 1000 0,8` — quando chego lá',
        '`' + prefix + 'minhareserva 3500 clt` — quanto guardar'
    ])
    doc += bloco('🏠 FINANCIAR', [
        '`' + prefix + 'financiamentoprice 200000 0,8 360` — parcela fixa',
        '`' + prefix + 'financiamentosac 200000 0,8 360` — parcela decrescente',
        '`' + prefix + 'compararfinanciamento 200000 0,8 360` — os dois lado a lado'
    ])
    doc += bloco('🧮 ENTENDER', [
        '`' + prefix + 'taxareal 10 4,5` — ganho descontada a inflação',
        '`' + prefix + 'convertertaxa 1 mes ano` — taxa entre períodos',
        '`' + prefix + 'inflacaocorroi 10000 4,5 10` — o que a inflação come'
    ])
    doc += bloco('📚 ESTUDAR', [
        '`' + prefix + 'conceitosfinanceiros` — glossário',
        '`' + prefix + 'produtosfinanceiros` — produtos e pegadinhas'
    ])
    doc += '\n_Todas as simulações usam taxa constante e não preveem o futuro._'
    return reply(doc)
    }
}
