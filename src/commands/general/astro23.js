/**
 * Comando .luatritao — TRITÃO
 *
 * Lua Tritão, satélite de Netuno.
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
    name: 'luatritao',
    aliases: ["satelitetritao"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Lua Tritão, satélite de Netuno',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const l = A.LUAS['tritao']
    let doc = cab("TRITÃO", '🌙')
    doc += linha('Orbita', l.planeta)
    doc += linha('Diâmetro', l.diametro.toLocaleString('pt-BR') + ' km')
    doc += linha('Descoberta', l.descoberta)
    doc += sep()
    doc += '🔭 ' + l.fato
    doc += '\n\n🌙 _Todas as luas:_ `' + prefix + 'luas`'
    return reply(doc)
    }
}
