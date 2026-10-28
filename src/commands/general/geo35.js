/**
 * Comando .biomamataatlantica — MATA ATLÂNTICA
 *
 * Bioma brasileiro: Mata Atlântica.
 */

const G = require('../../services/brazilGeoService')

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
    name: 'biomamataatlantica',
    aliases: ["ecossistemamataatlantica"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Bioma brasileiro: Mata Atlântica',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const b = G.BIOMAS['mataatlantica']
    let doc = cab("MATA ATLÂNTICA", '🌳')
    doc += linha('Do território', G.num(b.areaPct, 1) + '%')
    doc += linha('Onde fica', b.estados)
    doc += sep()
    doc += '📖 *O que é*\n' + b.oquee + '\n\n'
    doc += '🔎 *O que quase ninguém sabe*\n' + b.marca + '\n\n'
    doc += '⚠️ *Sob pressão*\n' + b.ameaca + '\n\n'
    doc += '📊 ' + barra(b.areaPct / 100) + ' do território nacional\n'
    doc += '🌳 _Todos os biomas:_ `' + prefix + 'biomasbrasil`'
    return reply(doc)
    }
}
