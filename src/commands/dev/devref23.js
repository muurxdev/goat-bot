/**
 * Comando .algoritmomergesort — MERGE SORT
 *
 * Algoritmo: Merge sort (ordenação).
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
    name: 'algoritmomergesort',
    aliases: ["algmergesort","cmd_algoritmomergesort","alt_algoritmomergesort","atalho_algoritmomergesort","abrev_algoritmomergesort","call_algoritmomergesort","func_algoritmomergesort"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Algoritmo: Merge sort (ordenação)',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = R.ALGORITMOS['mergesort']
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
