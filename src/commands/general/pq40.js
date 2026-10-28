/**
 * Comando .porquescasa — POR QUE — A CASA E AS COISAS
 *
 * Perguntas sobre a casa e as coisas.
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
    name: 'porquescasa',
    aliases: ["duvidascasa"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Perguntas sobre a casa e as coisas',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = W.AREAS['casa']
    const lista = W.porArea('casa')
    let doc = cab("POR QUE — A CASA E AS COISAS", a.emoji)
    doc += linha('Perguntas', String(lista.length)) + '\n'
    for (const f of lista) doc += '┃ *' + f.nome.replace(/^Por que /, '') + '*\n┃    `' + prefix + 'porque' + f.chave + '`\n'
    doc += '\n📚 _Todas as áreas:_ `' + prefix + 'porquetudo`'
    return reply(doc)
    }
}
