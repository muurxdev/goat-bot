/**
 * Comando .segurancaaltura — TRABALHO EM ALTURA
 *
 * Segurança: trabalho em altura.
 */

const H = require('../../services/homeRepairService')

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
    name: 'segurancaaltura',
    aliases: ["cuidadoaltura"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Segurança: trabalho em altura',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const s = H.SEGURANCA['altura']
    let doc = cab("TRABALHO EM ALTURA", '⚠️')
    doc += linha('Risco', s.risco)
    doc += sep()
    doc += '╭━〔 📋 REGRAS 〕━⬣\n'
    for (const r of s.regras) doc += '┃ ' + r + '\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '🚧 *Até onde dá para fazer sozinho*\n' + s.limite + '\n\n'
    doc += '☎️ _193 bombeiros · 192 SAMU · 0800 722 6001 intoxicação_'
    return reply(doc)
    }
}
