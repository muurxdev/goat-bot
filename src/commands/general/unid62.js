/**
 * Comando .unidademmhg — MILÍMETRO DE MERCÚRIO
 *
 * Unidade de pressão: Milímetro de mercúrio.
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
    name: 'unidademmhg',
    aliases: ["medmmhg"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Unidade de pressão: Milímetro de mercúrio',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = parseFloat(String(args[0] || '1').replace(',', '.')) || 1
    const t = U.tabelaDe('mmhg', valor)
    let doc = cab('MILÍMETRO DE MERCÚRIO', '🌡️')
    doc += linha('Categoria', t.categoria.nome)
    doc += linha('Sigla', 'mmhg')
    doc += linha('Sobre', "Pressão arterial.")
    doc += sep()
    doc += '*' + U.formatar(valor) + ' mmhg* equivale a:\n\n'
    for (const l of t.linhas) doc += '┃ ' + U.formatar(l.valor) + ' ' + l.sigla + ' _(' + l.nome + ')_\n'
    doc += '\n💡 _Outro valor:_ `' + prefix + 'unidademmhg 25`'
    return reply(doc)
    }
}
