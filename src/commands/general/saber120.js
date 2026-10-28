/**
 * Comando .maiorespaises — MAIORES PAÍSES
 *
 * Os países de maior área no catálogo.
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
    name: 'maiorespaises',
    aliases: ["paisesporarea"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Os países de maior área no catálogo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = Object.entries(K.PAISES).map(([k, p]) => ({ k, ...p })).sort((a, b) => b.area - a.area)
    let doc = cab('MAIORES PAÍSES', '📏')
    lista.slice(0, 15).forEach((p, i) => {
        doc += '┃ ' + (i + 1) + '. ' + p.nome + ' — ' + num(p.area) + ' km²\n'
    })
    return reply(doc)
    }
}
