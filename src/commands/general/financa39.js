/**
 * Comando .inflacaocorroi — O QUE A INFLAÇÃO COME
 *
 * Mostra quanto seu dinheiro vale depois de N anos.
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
    name: 'inflacaocorroi',
    aliases: ["poderdecompra"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Mostra quanto seu dinheiro vale depois de N anos',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = F.lerNumero(args[0])
    const infl = F.lerNumero(args[1])
    const anos = F.lerNumero(args[2])
    if (!Number.isFinite(valor) || !Number.isFinite(infl) || !Number.isFinite(anos)) {
        let doc = cab('O QUE A INFLAÇÃO COME', '📉')
        doc += '📌 Uso: `' + prefix + 'inflacaocorroi <valor> <inflação % ao ano> <anos>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'inflacaocorroi 10000 4,5 10`'
        return reply(doc)
    }
    const r = F.corrosaoInflacao({ valor, inflacaoAnual: infl, anos })
    let doc = cab('O QUE A INFLAÇÃO COME', '📉')
    doc += linha('Hoje você tem', F.moeda(r.valor))
    doc += linha('Inflação', F.pct(infl) + ' ao ano')
    doc += linha('Prazo', r.anos + (r.anos === 1 ? ' ano' : ' anos'))
    doc += sep()
    doc += bloco('💸 O ESTRAGO', [
        'Poder de compra daqui a ' + r.anos + ' anos: *' + F.moeda(r.equivalente) + '*',
        'Perda real: ' + F.pct(r.perdaPct),
        'Para manter o mesmo poder: ' + F.moeda(r.necessario)
    ])
    doc += '\n📊 *Quanto sobra do valor original*\n' + barra(r.equivalente / r.valor) + '\n\n'
    doc += '_Dinheiro parado não fica parado: encolhe._'
    return reply(doc)
    }
}
