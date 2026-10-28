/**
 * Comando .autorclarice — CLARICE LISPECTOR
 *
 * Autor: Clarice Lispector — o que fez e por onde começar.
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
    name: 'autorclarice',
    aliases: ["escritorclarice"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Autor: Clarice Lispector — o que fez e por onde começar',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = L.AUTORES['clarice']
    const e = L.ESCOLAS[a.escola]
    const obras = L.obrasDe('clarice')
    let doc = cab("CLARICE LISPECTOR", '✍️')
    doc += linha('Viveu', a.viveu)
    doc += linha('Escola', e.nome)
    doc += sep()
    doc += '📖 *O que fez*\n' + a.oquefez + '\n\n'
    doc += '🖋️ *Como escreve*\n' + a.estilo + '\n\n'
    doc += '🚪 *Por onde começar*\n' + a.comece + '\n\n'
    doc += '🔎 *Vale saber*\n' + a.curiosidade + '\n'
    if (obras.length) doc += '\n' + bloco('📕 OBRAS COM FICHA', obras.map(o => o.titulo + ' (' + o.ano + ', ' + o.paginas + 'p) `' + prefix + 'obra' + o.chave + '`'))
    doc += '\n📚 _A escola:_ `' + prefix + 'escola' + a.escola + '`'
    return reply(doc)
    }
}
