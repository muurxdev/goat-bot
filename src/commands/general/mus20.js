/**
 * Comando .generoforro — FORRÓ
 *
 * Gênero musical: Forró.
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
    name: 'generoforro',
    aliases: ["estiloforro"],
    category: 'general',
    subcategory: 'Música',
    description: 'Gênero musical: Forró',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const g = M.GENEROS['forro']
    let doc = cab("FORRÓ", '🎶')
    doc += linha('Origem', g.origem)
    doc += linha('Compasso', g.compasso)
    doc += linha('Andamento', g.bpm + ' BPM')
    doc += sep()
    doc += '🎯 *O que define o gênero*\n' + g.marca + '\n\n'
    doc += '🥁 *Instrumentos*\n' + g.instrumentos + '\n\n'
    doc += '⭐ *Nomes para conhecer*\n' + g.nomes + '\n\n'
    doc += '🎶 _Todos os gêneros:_ `' + prefix + 'generosmusicais`'
    return reply(doc)
    }
}
