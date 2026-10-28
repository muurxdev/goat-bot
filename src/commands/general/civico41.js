/**
 * Comando .listadocumentos — DOCUMENTOS
 *
 * Todos os documentos e como tirar cada um.
 */

const C = require('../../services/civicService')

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
    name: 'listadocumentos',
    aliases: ["documentos"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Todos os documentos e como tirar cada um',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('DOCUMENTOS', '🪪')
    doc += linha('Fichas', String(Object.keys(C.DOCUMENTOS).length)) + '\n'
    for (const [k, d] of Object.entries(C.DOCUMENTOS)) {
        doc += '┃ *' + d.nome + '*\n┃    ' + d.custo + ' · ' + d.prazo + '\n┃    `' + prefix + 'documento' + k + '`\n'
    }
    doc += '\n_Cada ficha traz órgão, prazo, custo e o que levar._'
    return reply(doc)
    }
}
