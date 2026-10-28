/**
 * Comando .escolamodernismo3 — MODERNISMO — 3ª FASE
 *
 * Escola literária: Modernismo — 3ª fase.
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
    name: 'escolamodernismo3',
    aliases: ["movimentomodernismo3"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Escola literária: Modernismo — 3ª fase',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = L.ESCOLAS['modernismo3']
    const autores = L.autoresDe('modernismo3')
    let doc = cab("MODERNISMO — 3ª FASE", '📚')
    doc += linha('Período', e.inicio + ' — ' + (e.fim === null ? 'hoje' : e.fim))
    doc += linha('Marco inicial', e.marco)
    doc += sep()
    doc += '🎯 *O que caracteriza*\n' + e.traco + '\n\n'
    doc += '🌍 *O que estava acontecendo*\n' + e.contexto + '\n\n'
    doc += '✍️ *Nomes*\n' + e.autores + '\n\n'
    doc += '🚪 *Por onde entrar*\n' + e.entrada + '\n'
    if (autores.length) doc += '\n' + bloco('📖 COM FICHA AQUI', autores.map(a => a.nome + ' `' + prefix + 'autor' + a.chave + '`'))
    doc += '\n📚 _Todas as escolas:_ `' + prefix + 'literaturabrasileira`'
    return reply(doc)
    }
}
