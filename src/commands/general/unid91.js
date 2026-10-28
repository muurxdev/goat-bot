/**
 * Comando .catalogounidades — CATÁLOGO DE UNIDADES
 *
 * Todas as categorias e unidades disponíveis.
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
    name: 'catalogounidades',
    aliases: ["todasunidades"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Todas as categorias e unidades disponíveis',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CATÁLOGO DE UNIDADES', '📚')
    const total = Object.values(U.CATEGORIAS).reduce((a, c) => a + Object.keys(c.unidades).length, 0)
    doc += linha('Categorias', String(Object.keys(U.CATEGORIAS).length + 1))
    doc += linha('Unidades', String(total + 3)) + '\n'
    for (const [k, c] of Object.entries(U.CATEGORIAS)) {
        doc += '┃ ' + c.emoji + ' *' + c.nome + '* (' + Object.keys(c.unidades).length + ')\n'
        doc += '┃    ' + Object.keys(c.unidades).join(', ') + '\n'
    }
    doc += '┃ 🌡️ *Temperatura* (3)\n┃    c, f, k\n'
    doc += '\n💡 _Converter:_ `' + prefix + 'converterqualquer 10 km milha`'
    return reply(doc)
    }
}
