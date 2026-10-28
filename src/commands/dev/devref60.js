/**
 * Comando .reflinguagens — LINGUAGENS
 *
 * Todas as linguagens com tipagem e uso.
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
    name: 'reflinguagens',
    aliases: ["tabelalinguagens","cmd_reflinguagens","alt_reflinguagens","atalho_reflinguagens","abrev_reflinguagens","call_reflinguagens","func_reflinguagens"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Todas as linguagens com tipagem e uso',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('LINGUAGENS', '💻')
    for (const [k, l] of Object.entries(R.LINGUAGENS)) {
        doc += '┃ *' + l.nome + '* — ' + l.tipagem + '\n┃    ' + l.usa + '\n'
    }
    doc += '\n💡 _Ficha de uma:_ `' + prefix + 'langpython`'
    return reply(doc)
    }
}
