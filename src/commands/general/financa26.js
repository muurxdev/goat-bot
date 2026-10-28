/**
 * Comando .produtoprevidencia — PREVIDÊNCIA PRIVADA
 *
 * Como funciona: Previdência privada.
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
    name: 'produtoprevidencia',
    aliases: ["sobreprevidencia"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Como funciona: Previdência privada',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = F.PRODUTOS['previdencia']
    let doc = cab("PREVIDÊNCIA PRIVADA", '🏦')
    doc += linha('Tipo', p.tipo)
    doc += linha('Risco', p.risco)
    doc += linha('Liquidez', p.liquidez)
    doc += linha('Imposto', p.imposto)
    doc += sep()
    doc += '⚙️ *Como funciona*\n' + p.comofunciona + '\n\n'
    doc += '🪤 *A pegadinha*\n' + p.pega + '\n\n'
    doc += '_Descrição de funcionamento, não recomendação de compra._'
    return reply(doc)
    }
}
