/**
 * Comando .deusatena — ATENA
 *
 * Atena — Panteão Grego: domínio, símbolos e mito.
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
    name: 'deusatena',
    aliases: ["mitoatena"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Atena — Panteão Grego: domínio, símbolos e mito',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = M.DEUSES['atena']
    const p = M.PANTEOES[d.panteao]
    let doc = cab("ATENA", p.emoji)
    doc += linha('Panteão', p.nome)
    doc += linha('Domínio', d.dominio)
    doc += linha('Símbolos', d.simbolo)
    doc += linha('Família', d.familia)
    if (d.equivale !== '—') doc += linha('Equivale a', d.equivale)
    doc += sep()
    doc += '📜 *O mito*\n' + d.mito
    doc += '\n\n' + p.emoji + ' _Todo o panteão:_ `' + prefix + 'panteaogrego`'
    return reply(doc)
    }
}
