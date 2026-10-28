/**
 * Comando .errosquetodomundocomete — O QUE TODO MUNDO ERRA
 *
 * Só as explicações erradas que a maioria acredita.
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
    name: 'errosquetodomundocomete',
    aliases: ["mitosdodiaadia"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Só as explicações erradas que a maioria acredita',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const todos = Object.entries(W.FENOMENOS).map(([k, f]) => ({ chave: k, ...f }))
    const pagina = Math.max(1, parseInt(args[0], 10) || 1)
    const porPagina = 6
    const total = Math.ceil(todos.length / porPagina)
    const fatia = todos.slice((pagina - 1) * porPagina, pagina * porPagina)
    if (!fatia.length) return reply('❌ Página vazia. São ' + total + ' páginas.')
    let doc = cab('O QUE TODO MUNDO ERRA', '❌')
    doc += linha('Página', pagina + ' de ' + total)
    doc += sep()
    for (const f of fatia) {
        doc += '❌ *' + f.nome.replace(/^Por que /, '') + '*\n' + f.engano + '\n📖 `' + prefix + 'porque' + f.chave + '`\n\n'
    }
    if (pagina < total) doc += '➡️ _Próxima:_ `' + prefix + 'errosquetodomundocomete ' + (pagina + 1) + '`'
    return reply(doc)
    }
}
