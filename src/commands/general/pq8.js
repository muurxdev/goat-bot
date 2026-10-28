/**
 * Comando .porquememoriacheiro — POR QUE CHEIRO TRAZ LEMBRANÇA TÃO FORTE
 *
 * Por que cheiro traz lembrança tão forte.
 */

const W = require('../../services/whyService')

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
    name: 'porquememoriacheiro',
    aliases: ["pqmemoriacheiro"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Por que cheiro traz lembrança tão forte',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = W.FENOMENOS['memoriacheiro']
    const a = W.AREAS[f.area]
    let doc = cab("POR QUE CHEIRO TRAZ LEMBRANÇA TÃO FORTE", a.emoji)
    doc += linha('Assunto', a.nome)
    doc += sep()
    doc += '💡 *A resposta*\n' + f.resposta + '\n\n'
    doc += '🔎 *O detalhe bom*\n' + f.detalhe + '\n\n'
    doc += '❌ *O que quase todo mundo acredita e está errado*\n' + f.engano + '\n\n'
    doc += a.emoji + ' _Mais sobre ' + a.nome.toLowerCase() + ':_ `' + prefix + 'porques corpo`\n'
    doc += '🎲 _Um aleatório:_ `' + prefix + 'porquealeatorio`'
    return reply(doc)
    }
}
