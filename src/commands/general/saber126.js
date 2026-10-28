/**
 * Comando .elementospor — ELEMENTOS POR CATEGORIA
 *
 * Os elementos agrupados por família química.
 */

const K = require('../../services/knowledgeService')

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

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }

module.exports = {
    name: 'elementospor',
    aliases: ["categoriaelementos"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Os elementos agrupados por família química',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porCat = new Map()
    for (const e of Object.values(K.ELEMENTOS)) {
        if (!porCat.has(e.categoria)) porCat.set(e.categoria, [])
        porCat.get(e.categoria).push(e)
    }
    let doc = cab('ELEMENTOS POR CATEGORIA', '🧪')
    for (const [cat, lista] of [...porCat].sort((a, b) => b[1].length - a[1].length)) {
        doc += '\n' + bloco(cat.toUpperCase(), [lista.map(e => e.simbolo + ' ' + e.nome).join(' · ')])
    }
    return reply(doc)
    }
}
