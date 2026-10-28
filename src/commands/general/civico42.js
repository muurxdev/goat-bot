/**
 * Comando .listadireitos — SEUS DIREITOS
 *
 * Direitos do consumidor com prazo e base legal.
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
    name: 'listadireitos',
    aliases: ["meusdireitos"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Direitos do consumidor com prazo e base legal',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('SEUS DIREITOS', '⚖️')
    doc += linha('Fichas', String(Object.keys(C.DIREITOS).length)) + '\n'
    for (const [k, d] of Object.entries(C.DIREITOS)) {
        doc += '┃ *' + d.nome + '*\n┃    prazo: ' + d.prazo + '\n┃    `' + prefix + 'direito' + k.toLowerCase() + '`\n'
    }
    doc += '\n_Resumo informativo, não parecer jurídico._'
    return reply(doc)
    }
}
