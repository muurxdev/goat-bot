/**
 * Comando .porquealeatorio — POR QUE — SORTEADO
 *
 * Sorteia uma pergunta e responde.
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
    name: 'porquealeatorio',
    aliases: ["vocesabia","curiosidadedodia"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Sorteia uma pergunta e responde',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = W.sortear()
    const a = W.AREAS[f.area]
    let doc = cab('VOCÊ SABIA?', '🎲')
    doc += a.emoji + ' *' + f.nome + '*\n\n'
    doc += '💡 ' + f.resposta + '\n\n'
    doc += '❌ *O engano comum*\n' + f.engano + '\n\n'
    doc += '📖 _Ficha completa:_ `' + prefix + 'porque' + f.chave + '`\n'
    doc += '🎲 _Outra:_ `' + prefix + 'porquealeatorio`'
    return reply(doc)
    }
}
