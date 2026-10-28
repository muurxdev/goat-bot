/**
 * Comando .paisesamericadosul — PAÍSES: AMÉRICA DO SUL
 *
 * Países de América do Sul no catálogo.
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
    name: 'paisesamericadosul',
    aliases: ["continenteamericadosul"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Países de América do Sul no catálogo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = K.porContinente("América do Sul")
    let doc = cab('PAÍSES: AMÉRICA DO SUL', '🗺️')
    doc += linha('No catálogo', String(lista.length)) + '\n'
    for (const p of lista) doc += '┃ ' + p.nome + ' — ' + p.capital + '\n'
    doc += '\n💡 _Ficha de um:_ `' + prefix + 'pais' + lista[0].chave + '`'
    return reply(doc)
    }
}
