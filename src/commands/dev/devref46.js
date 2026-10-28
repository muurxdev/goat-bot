/**
 * Comando .langrust — RUST
 *
 * Ficha da linguagem Rust.
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
    name: 'langrust',
    aliases: ["linguagemrust","cmd_langrust","alt_langrust","atalho_langrust","abrev_langrust","call_langrust","func_langrust"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Ficha da linguagem Rust',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const l = R.LINGUAGENS['rust']
    let doc = cab(l.nome.toUpperCase(), '💻')
    doc += linha('Tipagem', l.tipagem)
    doc += linha('Paradigma', l.paradigma)
    doc += linha('Usada em', l.usa)
    doc += sep()
    doc += linha('Ponto forte', l.forte)
    doc += linha('Ponto fraco', l.fraco)
    return reply(doc)
    }
}
