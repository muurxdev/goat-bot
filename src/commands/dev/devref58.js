/**
 * Comando .refalgoritmos — ALGORITMOS
 *
 * Todos os algoritmos por categoria e custo.
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
    name: 'refalgoritmos',
    aliases: ["tabelaalgoritmos","cmd_refalgoritmos","alt_refalgoritmos","atalho_refalgoritmos","abrev_refalgoritmos","call_refalgoritmos","func_refalgoritmos"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Todos os algoritmos por categoria e custo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porTipo = new Map()
    for (const [k, a] of Object.entries(R.ALGORITMOS)) {
        if (!porTipo.has(a.tipo)) porTipo.set(a.tipo, [])
        porTipo.get(a.tipo).push({ k, ...a })
    }
    let doc = cab('ALGORITMOS', '⚙️')
    for (const [tipo, lista] of porTipo) {
        doc += '\n' + bloco(tipo.toUpperCase(), lista.map(a => a.nome + ' — médio ' + a.medio))
    }
    return reply(doc)
    }
}
