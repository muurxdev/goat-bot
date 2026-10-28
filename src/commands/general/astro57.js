/**
 * Comando .fenomenoauroras — AURORAS POLARES
 *
 * Fenômeno celeste: Auroras polares.
 */

const A = require('../../services/astronomyService')

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
    name: 'fenomenoauroras',
    aliases: ["ceuauroras"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Fenômeno celeste: Auroras polares',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = A.FENOMENOS['auroras']
    let doc = cab("AURORAS POLARES", '🌠')
    doc += linha('Tipo', f.tipo)
    doc += linha('Frequência', f.frequencia)
    doc += sep()
    doc += '🔭 *O que é*\n' + f.oquee + '\n\n'
    doc += '📐 *O detalhe que quase ninguém sabe*\n' + f.detalhe + '\n\n'
    doc += '⚠️ *Para observar*\n' + f.cuidado
    doc += '\n\n🌠 _Outros fenômenos:_ `' + prefix + 'fenomenosceleste`'
    return reply(doc)
    }
}
