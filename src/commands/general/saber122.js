/**
 * Comando .moedasmundo — MOEDAS DO MUNDO
 *
 * Qual moeda cada país usa.
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
    name: 'moedasmundo',
    aliases: ["listamoedas"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Qual moeda cada país usa',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porMoeda = new Map()
    for (const p of Object.values(K.PAISES)) {
        if (!porMoeda.has(p.moeda)) porMoeda.set(p.moeda, [])
        porMoeda.get(p.moeda).push(p.nome)
    }
    const ord = [...porMoeda].sort((a, b) => b[1].length - a[1].length)
    let doc = cab('MOEDAS DO MUNDO', '💱')
    for (const [moeda, paises] of ord.slice(0, 20)) {
        doc += '┃ *' + moeda + '*\n┃    ' + paises.slice(0, 6).join(', ') + (paises.length > 6 ? '…' : '') + '\n'
    }
    return reply(doc)
    }
}
