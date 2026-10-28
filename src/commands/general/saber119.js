/**
 * Comando .paises — CATÁLOGO DE PAÍSES
 *
 * Todos os países disponíveis para consulta.
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
    name: 'paises',
    aliases: ["listapaises"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Todos os países disponíveis para consulta',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const todos = Object.entries(K.PAISES)
    const porCont = new Map()
    for (const [, p] of todos) porCont.set(p.continente, (porCont.get(p.continente) || 0) + 1)
    let doc = cab('CATÁLOGO DE PAÍSES', '🌍')
    doc += linha('Países', String(todos.length)) + '\n'
    doc += bloco('🗺️ POR CONTINENTE', [...porCont].map(([c, n]) => c + ' — ' + n))
    doc += '\n💡 _Ficha:_ `' + prefix + 'paisbrasil` · _Busca:_ `' + prefix + 'saberbuscar lisboa`'
    return reply(doc)
    }
}
