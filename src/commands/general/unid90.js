/**
 * Comando .converterqualquer — CONVERSOR UNIVERSAL
 *
 * Converte entre quaisquer unidades do catálogo.
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
    name: 'converterqualquer',
    aliases: ["conversao"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Converte entre quaisquer unidades do catálogo',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    if (args.length < 3) {
        let doc = cab('CONVERSOR UNIVERSAL', '🔄')
        doc += '📌 Uso: `' + prefix + 'converterqualquer 10 km milha`\n\n'
        doc += bloco('📚 CATEGORIAS', Object.entries(U.CATEGORIAS).map(([k, c]) =>
            c.emoji + ' ' + c.nome + ' — ' + Object.keys(c.unidades).length + ' unidades'))
        doc += '\n🌡️ Temperatura — c, f, k'
        doc += '\n\n💡 _Ver as unidades de uma categoria:_ `' + prefix + 'tabelacomprimento`'
        return reply(doc)
    }
    const r = U.converter(String(args[0]).replace(',', '.'), args[1], args[2])
    if (!r.ok) return reply('❌ ' + r.erro)
    let doc = cab('CONVERSOR UNIVERSAL', '🔄')
    if (r.categoriaNome) doc += linha('Categoria', r.categoriaNome)
    doc += sep()
    doc += '*' + U.formatar(String(args[0]).replace(',', '.')) + ' ' + r.de.nome + '*\n'
    doc += '= *' + U.formatar(r.resultado) + ' ' + r.para.nome + '*'
    return reply(doc)
    }
}
