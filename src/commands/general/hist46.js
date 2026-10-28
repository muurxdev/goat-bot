/**
 * Comando .figurashistoria — FIGURAS DA HISTÓRIA
 *
 * Pessoas que marcaram a história do Brasil.
 */

const B = require('../../services/brazilHistoryService')

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
    name: 'figurashistoria',
    aliases: ["personagensbrasil"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Pessoas que marcaram a história do Brasil',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('FIGURAS DA HISTÓRIA', '👥')
    doc += linha('Fichas', String(Object.keys(B.FIGURAS).length)) + '\n'
    for (const [k, f] of Object.entries(B.FIGURAS)) {
        doc += '┃ *' + f.nome + '* (' + f.viveu + ')\n┃    ' + f.papel + '\n┃    `' + prefix + 'figura' + k + '`\n'
    }
    return reply(doc)
    }
}
