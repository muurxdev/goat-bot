/**
 * Comando .teoriamusical — TEORIA MUSICAL
 *
 * Os conceitos básicos, cada um com exemplo prático.
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
    name: 'teoriamusical',
    aliases: ["teoria"],
    category: 'general',
    subcategory: 'Música',
    description: 'Os conceitos básicos, cada um com exemplo prático',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('TEORIA MUSICAL', '🎓')
    doc += linha('Conceitos', String(Object.keys(M.TEORIA).length)) + '\n'
    for (const [k, t] of Object.entries(M.TEORIA)) {
        doc += '┃ *' + t.nome + '*\n┃    `' + prefix + 'teoria' + k + '`\n'
    }
    doc += '\n🛠️ *Ferramentas*\n'
    doc += '┃ `' + prefix + 'campoharmonico C` — os acordes que combinam\n'
    doc += '┃ `' + prefix + 'transpor C Am F G7 2` — mudar de tom\n'
    doc += '┃ `' + prefix + 'circuloquintas C` — tons vizinhos\n'
    return reply(doc)
    }
}
