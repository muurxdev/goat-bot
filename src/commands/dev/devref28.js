/**
 * Comando .algoritmodijkstra — DIJKSTRA
 *
 * Algoritmo: Dijkstra (grafo).
 */

const R = require('../../services/devReferenceService')

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
    name: 'algoritmodijkstra',
    aliases: ["algdijkstra","cmd_algoritmodijkstra","alt_algoritmodijkstra","atalho_algoritmodijkstra","abrev_algoritmodijkstra","call_algoritmodijkstra","func_algoritmodijkstra"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Algoritmo: Dijkstra (grafo)',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = R.ALGORITMOS['dijkstra']
    let doc = cab(a.nome.toUpperCase(), '⚙️')
    doc += linha('Categoria', a.tipo)
    doc += linha('Melhor caso', a.melhor)
    doc += linha('Caso médio', a.medio)
    doc += linha('Pior caso', a.pior)
    doc += linha('Memória', a.memoria)
    doc += sep()
    doc += linha('Exige', a.exige)
    doc += linha('Use quando', a.quando)
    return reply(doc)
    }
}
