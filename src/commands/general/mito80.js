/**
 * Comando .panteoes — PANTEÕES
 *
 * Todos os panteões e quantos deuses cada um tem.
 */

const M = require('../../services/mythologyService')

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
    name: 'panteoes',
    aliases: ["mitologias"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Todos os panteões e quantos deuses cada um tem',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('PANTEÕES', '🗿')
    doc += linha('Panteões', String(Object.keys(M.PANTEOES).length))
    doc += linha('Deuses', String(Object.keys(M.DEUSES).length))
    doc += linha('Criaturas', String(Object.keys(M.CRIATURAS).length))
    doc += sep()
    for (const [k, p] of Object.entries(M.PANTEOES)) {
        doc += '┃ ' + p.emoji + ' *' + p.nome + '* (' + M.deusesDe(k).length + ')\n'
        doc += '┃    ' + p.local + ' · ' + p.fonte + '\n┃    `' + prefix + 'panteao' + k + '`\n'
    }
    doc += '\n🐉 _Criaturas:_ `' + prefix + 'bestiario`'
    return reply(doc)
    }
}
