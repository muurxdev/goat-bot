/**
 * Comando .refcomplexidades — TABELA DE COMPLEXIDADE
 *
 * Todas as complexidades da melhor para a pior.
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
    name: 'refcomplexidades',
    aliases: ["tabelabigo","cmd_refcomplexidades","alt_refcomplexidades","atalho_refcomplexidades","abrev_refcomplexidades","call_refcomplexidades","func_refcomplexidades"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Todas as complexidades da melhor para a pior',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('TABELA DE COMPLEXIDADE', '📈')
    for (const [k, c] of Object.entries(R.COMPLEXIDADES)) {
        doc += '┃ *' + c.notacao + '* ' + c.nome + '\n'
        doc += '┃    com 1 milhão: ' + c.em1milhao + '\n'
    }
    doc += '\n💡 _Detalhe de uma:_ `' + prefix + 'biglinear`'
    return reply(doc)
    }
}
