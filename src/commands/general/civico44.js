/**
 * Comando .listagolpes — GOLPES CONHECIDOS
 *
 * Catálogo de golpes e como reconhecer cada um.
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
    name: 'listagolpes',
    aliases: ["golpes"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Catálogo de golpes e como reconhecer cada um',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('GOLPES CONHECIDOS', '🚨')
    doc += linha('Fichas', String(Object.keys(C.GOLPES).length)) + '\n'
    for (const [k, g] of Object.entries(C.GOLPES)) {
        doc += '┃ *' + g.nome + '* (' + g.canal + ')\n┃    `' + prefix + 'golpe' + k.toLowerCase() + '`\n'
    }
    doc += '\n🛡️ _Regra geral: urgência + sigilo + pagamento imediato = golpe._'
    return reply(doc)
    }
}
