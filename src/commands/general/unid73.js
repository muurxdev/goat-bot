/**
 * Comando .tabelamassa — UNIDADES DE MASSA
 *
 * Todas as unidades de massa e suas equivalências.
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
    name: 'tabelamassa',
    aliases: ["unidadesmassa"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Todas as unidades de massa e suas equivalências',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const cat = U.CATEGORIAS['massa']
    let doc = cab('UNIDADES DE MASSA', '⚖️')
    doc += linha('Unidade base', cat.base)
    doc += linha('Quantas', String(Object.keys(cat.unidades).length)) + '\n'
    const ord = Object.entries(cat.unidades).sort((a, b) => a[1].fator - b[1].fator)
    for (const [s, i] of ord) {
        doc += '┃ *' + s + '* — ' + i.nome + '\n┃    ' + i.nota + '\n'
    }
    doc += '\n💡 _Converter:_ `' + prefix + 'convertermassa 10 ' + ord[0][0] + ' ' + ord[ord.length - 1][0] + '`'
    return reply(doc)
    }
}
