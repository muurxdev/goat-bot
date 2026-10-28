/**
 * Comando .literaturabrasileira — LITERATURA BRASILEIRA
 *
 * As escolas literárias em ordem cronológica.
 */

const L = require('../../services/literatureService')

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
    name: 'literaturabrasileira',
    aliases: ["literatura","escolasliterarias"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'As escolas literárias em ordem cronológica',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('LITERATURA BRASILEIRA', '📚')
    doc += linha('Escolas', String(Object.keys(L.ESCOLAS).length))
    doc += linha('Autores', String(Object.keys(L.AUTORES).length))
    doc += linha('Obras', String(Object.keys(L.OBRAS).length))
    doc += sep()
    for (const [k, e] of Object.entries(L.ESCOLAS)) {
        doc += '┃ *' + e.nome + '* (' + e.inicio + '—' + (e.fim === null ? 'hoje' : e.fim) + ')\n'
        doc += '┃    ' + e.autores.split(',')[0].trim() + ' e outros\n'
        doc += '┃    `' + prefix + 'escola' + k + '`\n'
    }
    doc += '\n🚪 _Não sabe por onde começar?_ `' + prefix + 'roteiroleitura`\n'
    doc += '✍️ _Autores:_ `' + prefix + 'autoresbrasileiros`   📕 _Obras:_ `' + prefix + 'obrasbrasileiras`'
    return reply(doc)
    }
}
