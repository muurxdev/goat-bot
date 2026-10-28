/**
 * Comando .teoriatablatura — TABLATURA
 *
 * Teoria musical: Tablatura.
 */

const M = require('../../services/musicService')

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
    name: 'teoriatablatura',
    aliases: ["oqueetablatura"],
    category: 'general',
    subcategory: 'Música',
    description: 'Teoria musical: Tablatura',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const t = M.TEORIA['tablatura']
    let doc = cab("TABLATURA", '🎓')
    doc += '📖 *O que é*\n' + t.oquee + '\n\n'
    doc += '📐 *Como funciona*\n' + t.detalhe + '\n\n'
    doc += '🎹 *Na prática*\n' + t.exemplo + '\n\n'
    doc += '🎓 _Toda a teoria:_ `' + prefix + 'teoriamusical`'
    return reply(doc)
    }
}
