/**
 * Comando .missoesespaciais — MISSÕES ESPACIAIS
 *
 * Todas as missões em ordem cronológica.
 */

const A = require('../../services/astronomyService')

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
    name: 'missoesespaciais',
    aliases: ["sondas","historiaespacial"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Todas as missões em ordem cronológica',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('MISSÕES ESPACIAIS', '🚀')
    const ord = Object.entries(A.MISSOES).sort((a, b) => a[1].ano - b[1].ano)
    doc += linha('Missões', String(ord.length)) + '\n'
    for (const [k, m] of ord) {
        doc += '┃ *' + m.ano + '* — ' + m.nome + '\n┃    ' + m.alvo + ' · ' + m.status + '\n┃    `' + prefix + 'missao' + k + '`\n'
    }
    return reply(doc)
    }
}
