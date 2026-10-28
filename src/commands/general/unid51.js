/**
 * Comando .unidadepb — PETABYTE
 *
 * Unidade de dados digitais: Petabyte.
 */

const U = require('../../services/unitsService')

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
    name: 'unidadepb',
    aliases: ["medpb"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Unidade de dados digitais: Petabyte',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = parseFloat(String(args[0] || '1').replace(',', '.')) || 1
    const t = U.tabelaDe('pb', valor)
    let doc = cab('PETABYTE', '💾')
    doc += linha('Categoria', t.categoria.nome)
    doc += linha('Sigla', 'pb')
    doc += linha('Sobre', "Escala de centro de dados.")
    doc += sep()
    doc += '*' + U.formatar(valor) + ' pb* equivale a:\n\n'
    for (const l of t.linhas) doc += '┃ ' + U.formatar(l.valor) + ' ' + l.sigla + ' _(' + l.nome + ')_\n'
    doc += '\n💡 _Outro valor:_ `' + prefix + 'unidadepb 25`'
    return reply(doc)
    }
}
