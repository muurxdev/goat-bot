/**
 * Comando .afinacoes — AFINAÇÕES PADRÃO
 *
 * A afinação de cada instrumento de corda.
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
    name: 'afinacoes',
    aliases: ["comoafinar"],
    category: 'general',
    subcategory: 'Música',
    description: 'A afinação de cada instrumento de corda',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('AFINAÇÕES PADRÃO', '🎸')
    const cordas = Object.entries(M.INSTRUMENTOS).filter(([, i]) => /cordas|teclas|palhetas/i.test(i.familia))
    for (const [k, i] of cordas) {
        doc += '┃ *' + i.nome + '*\n┃    ' + i.afinacao + '\n┃    `' + prefix + 'instrumento' + k + '`\n'
    }
    doc += '\n🔤 *A tabela das letras*\n'
    doc += Object.entries(M.NOTAS_PT).map(([l, p]) => l + ' = ' + p).join(' · ')
    doc += '\n\n💡 _Afine sempre subindo até a nota. Chegar por cima deixa a corda folgada na cravelha e ela desafina sozinha._'
    return reply(doc)
    }
}
