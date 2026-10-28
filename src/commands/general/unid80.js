/**
 * Comando .convertertempo — CONVERTER TEMPO
 *
 * Converte qualquer unidade de tempo.
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
    name: 'convertertempo',
    aliases: ["convtempo"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Converte qualquer unidade de tempo',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const cat = U.CATEGORIAS['tempo']
    const siglas = Object.keys(cat.unidades)
    if (args.length < 3) {
        let doc = cab('CONVERTER TEMPO', '⏱️')
        doc += '📌 Uso: `' + prefix + 'convertertempo 10 s min`\n\n'
        doc += bloco('📐 UNIDADES', siglas.map(s => s + ' — ' + cat.unidades[s].nome))
        return reply(doc)
    }
    const r = U.converter(String(args[0]).replace(',', '.'), args[1], args[2])
    if (!r.ok) return reply('❌ ' + r.erro)
    let doc = cab('CONVERTER TEMPO', '⏱️')
    doc += linha('De', U.formatar(String(args[0]).replace(',', '.')) + ' ' + r.de.nome)
    doc += linha('Para', U.formatar(r.resultado) + ' ' + r.para.nome)
    doc += sep()
    doc += '*' + U.formatar(String(args[0]).replace(',', '.')) + ' ' + String(args[1]).toLowerCase() + ' = ' + U.formatar(r.resultado) + ' ' + String(args[2]).toLowerCase() + '*'
    return reply(doc)
    }
}
