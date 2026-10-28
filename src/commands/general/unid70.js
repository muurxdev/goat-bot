/**
 * Comando .convertercomprimento — CONVERTER COMPRIMENTO
 *
 * Converte qualquer unidade de comprimento.
 */

const U = require('../../services/unitsService')

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
    name: 'convertercomprimento',
    aliases: ["convcomprimento"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Converte qualquer unidade de comprimento',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const cat = U.CATEGORIAS['comprimento']
    const siglas = Object.keys(cat.unidades)
    if (args.length < 3) {
        let doc = cab('CONVERTER COMPRIMENTO', '📏')
        doc += '📌 Uso: `' + prefix + 'convertercomprimento 10 mm cm`\n\n'
        doc += bloco('📐 UNIDADES', siglas.map(s => s + ' — ' + cat.unidades[s].nome))
        return reply(doc)
    }
    const r = U.converter(String(args[0]).replace(',', '.'), args[1], args[2])
    if (!r.ok) return reply('❌ ' + r.erro)
    let doc = cab('CONVERTER COMPRIMENTO', '📏')
    doc += linha('De', U.formatar(String(args[0]).replace(',', '.')) + ' ' + r.de.nome)
    doc += linha('Para', U.formatar(r.resultado) + ' ' + r.para.nome)
    doc += sep()
    doc += '*' + U.formatar(String(args[0]).replace(',', '.')) + ' ' + String(args[1]).toLowerCase() + ' = ' + U.formatar(r.resultado) + ' ' + String(args[2]).toLowerCase() + '*'
    return reply(doc)
    }
}
