/**
 * Comando .refpadroes — PADRÕES DE PROJETO
 *
 * Todos os padrões e o problema que resolvem.
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
    name: 'refpadroes',
    aliases: ["tabelapadroes","cmd_refpadroes","alt_refpadroes","atalho_refpadroes","abrev_refpadroes","call_refpadroes","func_refpadroes"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Todos os padrões e o problema que resolvem',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porFamilia = new Map()
    for (const [k, p] of Object.entries(R.PADROES)) {
        if (!porFamilia.has(p.familia)) porFamilia.set(p.familia, [])
        porFamilia.get(p.familia).push(p)
    }
    let doc = cab('PADRÕES DE PROJETO', '🧩')
    for (const [fam, lista] of porFamilia) {
        doc += '\n' + bloco(fam.toUpperCase(), lista.map(p => p.nome + ' — ' + p.problema))
    }
    return reply(doc)
    }
}
