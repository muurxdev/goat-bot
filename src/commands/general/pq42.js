/**
 * Comando .porquetudo — POR QUE AS COISAS SÃO ASSIM
 *
 * Todas as perguntas, por área.
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
    name: 'porquetudo',
    aliases: ["porques","porque"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Todas as perguntas, por área',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    // Quem digita ".porques natureza" espera a área, não o índice inteiro.
    // Sem isto o argumento era ignorado em silêncio, que é pior que recusar.
    const pedida = String(args[0] || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    if (pedida && W.AREAS[pedida]) {
        const a = W.AREAS[pedida]
        const lista = W.porArea(pedida)
        let d = cab(('POR QUE — ' + a.nome).toUpperCase(), a.emoji)
        d += linha('Perguntas', String(lista.length)) + '\n'
        for (const f of lista) d += '┃ *' + f.nome.replace(/^Por que /, '') + '*\n┃    `' + prefix + 'porque' + f.chave + '`\n'
        d += '\n📚 _Todas as áreas:_ `' + prefix + 'porquetudo`'
        return reply(d)
    }
    let doc = cab('POR QUE AS COISAS SÃO ASSIM', '💡')
    doc += linha('Perguntas', String(Object.keys(W.FENOMENOS).length))
    doc += linha('Áreas', String(Object.keys(W.AREAS).length)) + '\n'
    for (const [k, a] of Object.entries(W.AREAS)) {
        const lista = W.porArea(k)
        doc += bloco(a.emoji + ' ' + a.nome.toUpperCase() + ' (' + lista.length + ')',
            lista.map(f => f.nome.replace(/^Por que /, '') + ' `' + prefix + 'porque' + f.chave + '`'))
    }
    doc += '\n🎲 _Sortear uma:_ `' + prefix + 'porquealeatorio`\n'
    doc += '❌ _Só os enganos:_ `' + prefix + 'errosquetodomundocomete`'
    return reply(doc)
    }
}
