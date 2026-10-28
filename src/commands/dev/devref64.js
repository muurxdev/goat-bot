/**
 * Comando .qualordenacao — QUAL ORDENAÇÃO USAR
 *
 * Ajuda a escolher o algoritmo de ordenação.
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
    name: 'qualordenacao',
    aliases: ["escolherordenacao","cmd_qualordenacao","alt_qualordenacao","atalho_qualordenacao","abrev_qualordenacao","call_qualordenacao","func_qualordenacao"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Ajuda a escolher o algoritmo de ordenação',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('QUAL ORDENAÇÃO USAR', '🔀')
    doc += '┃ *Na dúvida* — quick sort. É o padrão das bibliotecas.\n'
    doc += '┃ *Precisa de garantia* — merge sort: O(n log n) sempre.\n'
    doc += '┃ *Sem memória extra* — heap sort: O(1) de espaço.\n'
    doc += '┃ *Lista quase ordenada* — insertion sort: chega a O(n).\n'
    doc += '┃ *Ordem estável importa* — merge sort.\n'
    doc += '\n_Estável = itens iguais mantêm a ordem original._'
    return reply(doc)
    }
}
