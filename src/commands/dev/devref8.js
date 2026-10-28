/**
 * Comando .bigfatorial — O(n!) — FATORIAL
 *
 * Complexidade O(n!): Fatorial.
 */

const R = require('../../services/devReferenceService')

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
    name: 'bigfatorial',
    aliases: ["complexidadefatorial","cmd_bigfatorial","alt_bigfatorial","atalho_bigfatorial","abrev_bigfatorial","call_bigfatorial","func_bigfatorial"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Complexidade O(n!): Fatorial',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = R.COMPLEXIDADES['fatorial']
    let doc = cab(c.notacao + ' — ' + c.nome.toUpperCase(), '📈')
    doc += linha('Significa', c.significado)
    doc += linha('Exemplo', c.exemplo)
    doc += linha('Com 1 milhão de itens', c.em1milhao)
    return reply(doc)
    }
}
