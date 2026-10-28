/**
 * Comando .missaoperseverance — PERSEVERANCE
 *
 * Missão espacial: Perseverance (2020).
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
    name: 'missaoperseverance',
    aliases: ["sondaperseverance"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Missão espacial: Perseverance (2020)',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const m = A.MISSOES['perseverance']
    let doc = cab("PERSEVERANCE", '🚀')
    doc += linha('Agência', m.agencia)
    doc += linha('Lançamento', String(m.ano))
    doc += linha('Alvo', m.alvo)
    doc += linha('Situação', m.status)
    doc += sep()
    doc += '🏆 *O feito*\n' + m.feito
    doc += '\n\n🚀 _Todas as missões:_ `' + prefix + 'missoes`'
    return reply(doc)
    }
}
