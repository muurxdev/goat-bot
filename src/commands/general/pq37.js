/**
 * Comando .porquescorpo — POR QUE — O CORPO
 *
 * Perguntas sobre o corpo.
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
    name: 'porquescorpo',
    aliases: ["duvidascorpo"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Perguntas sobre o corpo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = W.AREAS['corpo']
    const lista = W.porArea('corpo')
    let doc = cab("POR QUE — O CORPO", a.emoji)
    doc += linha('Perguntas', String(lista.length)) + '\n'
    for (const f of lista) doc += '┃ *' + f.nome.replace(/^Por que /, '') + '*\n┃    `' + prefix + 'porque' + f.chave + '`\n'
    doc += '\n📚 _Todas as áreas:_ `' + prefix + 'porquetudo`'
    return reply(doc)
    }
}
