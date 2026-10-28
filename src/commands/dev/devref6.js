/**
 * Comando .bigcubica — O(n³) — CÚBICA
 *
 * Complexidade O(n³): Cúbica.
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
    name: 'bigcubica',
    aliases: ["complexidadecubica","cmd_bigcubica","alt_bigcubica","atalho_bigcubica","abrev_bigcubica","call_bigcubica","func_bigcubica"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Complexidade O(n³): Cúbica',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = R.COMPLEXIDADES['cubica']
    let doc = cab(c.notacao + ' — ' + c.nome.toUpperCase(), '📈')
    doc += linha('Significa', c.significado)
    doc += linha('Exemplo', c.exemplo)
    doc += linha('Com 1 milhão de itens', c.em1milhao)
    return reply(doc)
    }
}
