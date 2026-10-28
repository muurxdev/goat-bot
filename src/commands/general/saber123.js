/**
 * Comando .idiomasmundo — IDIOMAS DO MUNDO
 *
 * Quais países falam cada idioma.
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
    name: 'idiomasmundo',
    aliases: ["listaidiomas"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Quais países falam cada idioma',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porIdioma = new Map()
    for (const p of Object.values(K.PAISES)) {
        for (const i of String(p.idioma).split(/,| e /).map(s => s.trim()).filter(Boolean)) {
            if (!porIdioma.has(i)) porIdioma.set(i, [])
            porIdioma.get(i).push(p.nome)
        }
    }
    const ord = [...porIdioma].sort((a, b) => b[1].length - a[1].length)
    let doc = cab('IDIOMAS DO MUNDO', '🗣️')
    for (const [idioma, paises] of ord.slice(0, 15)) {
        doc += '┃ *' + idioma + '* (' + paises.length + ')\n┃    ' + paises.slice(0, 5).join(', ') + '\n'
    }
    return reply(doc)
    }
}
