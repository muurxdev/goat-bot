/**
 * Comando .panteaonordico — PANTEÃO NÓRDICO
 *
 * Todos os deuses do panteão nórdico.
 */

const M = require('../../services/mythologyService')

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
    name: 'panteaonordico',
    aliases: ["deusesnordico"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Todos os deuses do panteão nórdico',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = M.PANTEOES['nordico']
    const lista = M.deusesDe('nordico')
    let doc = cab("PANTEÃO NÓRDICO", p.emoji)
    doc += linha('Morada', p.local)
    doc += linha('Fonte', p.fonte)
    doc += linha('Deuses', String(lista.length))
    doc += sep()
    for (const d of lista) {
        doc += '┃ *' + d.nome + '* — ' + d.dominio + '\n┃    `' + prefix + 'deus' + d.chave.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase() + '`\n'
    }
    return reply(doc)
    }
}
