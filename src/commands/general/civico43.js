/**
 * Comando .listasocorros — PRIMEIROS SOCORROS
 *
 * Todas as situações de emergência cobertas.
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
    name: 'listasocorros',
    aliases: ["primeirossocorros"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Todas as situações de emergência cobertas',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('PRIMEIROS SOCORROS', '🚑')
    doc += linha('Situações', String(Object.keys(C.SOCORROS).length)) + '\n'
    for (const [k, s] of Object.entries(C.SOCORROS)) {
        doc += '┃ *' + s.nome + '* — urgência ' + s.urgencia + '\n┃    `' + prefix + 'socorro' + k + '`\n'
    }
    doc += '\n☎️ _Telefones de emergência:_ `' + prefix + 'telefonesuteis`'
    return reply(doc)
    }
}
