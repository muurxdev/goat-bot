/**
 * Comando .sistemasolar — SISTEMA SOLAR
 *
 * Todos os corpos do sistema solar em ordem de distância.
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
    name: 'sistemasolar',
    aliases: ["planetas"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Todos os corpos do sistema solar em ordem de distância',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('SISTEMA SOLAR', '🌌')
    const ord = Object.entries(A.CORPOS).sort((a, b) => a[1].distancia - b[1].distancia)
    doc += linha('Corpos catalogados', String(ord.length)) + '\n'
    for (const [k, c] of ord) {
        doc += '┃ *' + c.nome + '* — ' + c.tipo + '\n'
        doc += '┃    ' + (c.distancia ? c.distancia.toLocaleString('pt-BR') + ' mi km · ' : '') + c.luas + ' luas\n'
        doc += '┃    `' + prefix + 'astro' + k + '`\n'
    }
    doc += '\n🌙 _Luas:_ `' + prefix + 'luas`   🚀 _Missões:_ `' + prefix + 'missoes`'
    return reply(doc)
    }
}
