/**
 * Comando .instrumentopiano — PIANO
 *
 * Instrumento: Piano — como funciona e por onde começar.
 */

const M = require('../../services/musicService')

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
    name: 'instrumentopiano',
    aliases: ["tocarpiano"],
    category: 'general',
    subcategory: 'Música',
    description: 'Instrumento: Piano — como funciona e por onde começar',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const i = M.INSTRUMENTOS['piano']
    let doc = cab("PIANO", '🎼')
    doc += linha('Família', i.familia)
    doc += linha('Afinação', i.afinacao)
    doc += linha('Para começar', i.dificuldade)
    doc += sep()
    doc += '⚙️ *Como produz som*\n' + i.comofunciona + '\n\n'
    doc += '🎯 *Os primeiros passos*\n' + i.primeiros + '\n\n'
    doc += '🔎 *Vale saber*\n' + i.curiosidade + '\n\n'
    doc += '🎼 _Todos os instrumentos:_ `' + prefix + 'instrumentos`'
    return reply(doc)
    }
}
