/**
 * Comando .generosmusicais — GÊNEROS MUSICAIS
 *
 * Gêneros com origem, andamento e nomes para conhecer.
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
    name: 'generosmusicais',
    aliases: ["estilosmusicais"],
    category: 'general',
    subcategory: 'Música',
    description: 'Gêneros com origem, andamento e nomes para conhecer',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('GÊNEROS MUSICAIS', '🎶')
    doc += linha('Gêneros', String(Object.keys(M.GENEROS).length)) + '\n'
    for (const [k, g] of Object.entries(M.GENEROS)) {
        doc += '┃ *' + g.nome + '* — ' + g.bpm + ' BPM\n┃    ' + g.origem + '\n┃    `' + prefix + 'genero' + k + '`\n'
    }
    doc += '\n🥁 _Acertar o metrônomo:_ `' + prefix + 'bpmgenero samba`'
    return reply(doc)
    }
}
