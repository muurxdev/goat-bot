/**
 * Comando .fenomenosceleste — FENÔMENOS CELESTES
 *
 * Eclipses, chuvas de meteoros e outros eventos do céu.
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
    name: 'fenomenosceleste',
    aliases: ["fenomenosceu"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Eclipses, chuvas de meteoros e outros eventos do céu',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('FENÔMENOS CELESTES', '🌠')
    doc += linha('Fenômenos', String(Object.keys(A.FENOMENOS).length)) + '\n'
    for (const [k, f] of Object.entries(A.FENOMENOS)) {
        doc += '┃ *' + f.nome + '* — ' + f.frequencia + '\n┃    `' + prefix + 'fenomeno' + k + '`\n'
    }
    doc += '\n_Cada ficha traz o que é, o detalhe pouco conhecido e como observar com segurança._'
    return reply(doc)
    }
}
