/**
 * Comando .plantasuculenta — SUCULENTAS EM GERAL
 *
 * Como cuidar de suculentas em geral: luz, rega e o que dá errado.
 */

const H = require('../../services/homeLifeService')

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
    name: 'plantasuculenta',
    aliases: ["cuidarsuculenta"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Como cuidar de suculentas em geral: luz, rega e o que dá errado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = H.PLANTAS['suculenta']
    let doc = cab("SUCULENTAS EM GERAL", '🪴')
    doc += linha('Luz', p.luz)
    doc += linha('Rega', p.rega)
    doc += linha('Dificuldade', p.dificuldade)
    doc += linha('Porte', p.porte)
    doc += linha('Com bicho em casa', p.toxica ? '⚠️ tóxica se ingerida' : '✅ não tóxica')
    doc += sep()
    doc += '🌱 *Como cuidar*\n' + p.cuidado + '\n\n'
    doc += '🔧 *O problema mais comum*\n' + p.problema
    doc += '\n\n🪴 _Todas as plantas:_ `' + prefix + 'plantas`'
    if (p.toxica) doc += '\n🐾 _Plantas seguras para pets:_ `' + prefix + 'plantasseguras`'
    return reply(doc)
    }
}
