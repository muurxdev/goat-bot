/**
 * Comando .porquesanimais — POR QUE — OS ANIMAIS
 *
 * Perguntas sobre os animais.
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
    name: 'porquesanimais',
    aliases: ["duvidasanimais"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Perguntas sobre os animais',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = W.AREAS['animais']
    const lista = W.porArea('animais')
    let doc = cab("POR QUE — OS ANIMAIS", a.emoji)
    doc += linha('Perguntas', String(lista.length)) + '\n'
    for (const f of lista) doc += '┃ *' + f.nome.replace(/^Por que /, '') + '*\n┃    `' + prefix + 'porque' + f.chave + '`\n'
    doc += '\n📚 _Todas as áreas:_ `' + prefix + 'porquetudo`'
    return reply(doc)
    }
}
