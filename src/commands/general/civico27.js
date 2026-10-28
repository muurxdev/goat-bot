/**
 * Comando .socorrofratura — FRATURA OU SUSPEITA
 *
 * Primeiros socorros: fratura ou suspeita.
 */

const C = require('../../services/civicService')

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
    name: 'socorrofratura',
    aliases: ["oqfazerfratura"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Primeiros socorros: fratura ou suspeita',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const s = C.SOCORROS['fratura']
    let doc = cab("FRATURA OU SUSPEITA", '🚑')
    doc += linha('Urgência', s.urgencia)
    doc += linha('Ligue para', s.telefone)
    doc += sep()
    doc += bloco('🔍 SINAIS', s.sinais)
    doc += '\n╭━〔 ✅ O QUE FAZER 〕━⬣\n'
    s.passos.forEach((p, i) => { doc += '┃ *' + (i + 1) + '.* ' + p + '\n' })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '🚫 *Nunca faça*\n' + s.naofaca + '\n\n'
    doc += '_Orientação geral de primeiros socorros. Chame o socorro profissional._'
    return reply(doc)
    }
}
