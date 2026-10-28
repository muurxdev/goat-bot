/**
 * Comando .refajuda — GUIA DA REFERÊNCIA
 *
 * Todos os catálogos técnicos disponíveis.
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
    name: 'refajuda',
    aliases: ["guiareferencia","cmd_refajuda","alt_refajuda","atalho_refajuda","abrev_refajuda","call_refajuda","func_refajuda"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Todos os catálogos técnicos disponíveis',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('GUIA DA REFERÊNCIA', '🗺️')
    doc += linha('Complexidades', String(Object.keys(R.COMPLEXIDADES).length))
    doc += linha('Estruturas', String(Object.keys(R.ESTRUTURAS).length))
    doc += linha('Algoritmos', String(Object.keys(R.ALGORITMOS).length))
    doc += linha('Padrões', String(Object.keys(R.PADROES).length))
    doc += linha('Linguagens', String(Object.keys(R.LINGUAGENS).length))
    doc += '\n' + bloco('📚 ÍNDICES', [
        '`' + prefix + 'refcomplexidades` · `' + prefix + 'refestruturas`',
        '`' + prefix + 'refalgoritmos` · `' + prefix + 'refpadroes`',
        '`' + prefix + 'reflinguagens`'
    ])
    doc += '\n' + bloco('🤔 DECIDIR', [
        '`' + prefix + 'qualestrutura` · `' + prefix + 'qualordenacao`',
        '`' + prefix + 'compararestruturas a b` · `' + prefix + 'refbuscar <termo>`'
    ])
    return reply(doc)
    }
}
