/**
 * Comando .biomasbrasil — BIOMAS DO BRASIL
 *
 * Os seis biomas, quanto ocupam e o que ameaça cada um.
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
    name: 'biomasbrasil',
    aliases: ["biomasdobrasil"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Os seis biomas, quanto ocupam e o que ameaça cada um',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('BIOMAS DO BRASIL', '🌳')
    doc += linha('Biomas', String(Object.keys(G.BIOMAS).length)) + '\n'
    const ord = Object.entries(G.BIOMAS).sort((a, b) => b[1].areaPct - a[1].areaPct)
    for (const [k, b] of ord) {
        doc += '┃ *' + b.nome + '* — ' + G.num(b.areaPct, 1) + '% do território\n'
        doc += '┃    ' + barra(b.areaPct / 100) + '\n'
        doc += '┃    `' + prefix + 'bioma' + k + '`\n'
    }
    doc += '\n🔎 *O detalhe que resume tudo*\nA Caatinga é o único bioma exclusivamente brasileiro. A Mata Atlântica, onde vivem 7 em cada 10 brasileiros, é a que menos sobrou: cerca de 12% da cobertura original.'
    return reply(doc)
    }
}
