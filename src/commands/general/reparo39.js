/**
 * Comando .segurancasnacasa — SEGURANÇA NA OBRA DE CASA
 *
 * O que respeitar antes de mexer em cada coisa.
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
    name: 'segurancasnacasa',
    aliases: ["seguranca"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'O que respeitar antes de mexer em cada coisa',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('SEGURANÇA NA OBRA DE CASA', '⚠️')
    doc += linha('Frentes', String(Object.keys(H.SEGURANCA).length)) + '\n'
    for (const [k, s] of Object.entries(H.SEGURANCA)) {
        doc += '┃ *' + s.nome + '* — risco ' + s.risco + '\n┃    `' + prefix + 'seguranca' + k + '`\n'
    }
    doc += '\n🚨 *As três que não se negocia*\n'
    doc += '┃ Cheiro de gás: não acenda nada, nem a luz\n'
    doc += '┃ Elétrica: confirme com chave-teste, não com o disjuntor\n'
    doc += '┃ Fogo em óleo: abafe com tampa, nunca água\n'
    return reply(doc)
    }
}
