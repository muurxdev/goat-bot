/**
 * Comando .autoresbrasileiros — AUTORES BRASILEIROS
 *
 * Autores agrupados por escola literária.
 */

const L = require('../../services/literatureService')

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
    name: 'autoresbrasileiros',
    aliases: ["escritoresbr"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Autores agrupados por escola literária',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('AUTORES BRASILEIROS', '✍️')
    doc += linha('Fichas', String(Object.keys(L.AUTORES).length)) + '\n'
    for (const [k, e] of Object.entries(L.ESCOLAS)) {
        const lista = L.autoresDe(k)
        if (!lista.length) continue
        doc += bloco(e.nome.toUpperCase(), lista.map(a => a.nome + ' (' + a.viveu + ') `' + prefix + 'autor' + a.chave + '`'))
    }
    return reply(doc)
    }
}
