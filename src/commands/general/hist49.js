/**
 * Comando .mitoshistoria — O QUE A GENTE ERRA
 *
 * Os enganos mais comuns sobre a história do Brasil.
 */

const B = require('../../services/brazilHistoryService')

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
    name: 'mitoshistoria',
    aliases: ["errosdehistoria"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Os enganos mais comuns sobre a história do Brasil',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const todos = []
    for (const [k, p] of Object.entries(B.PERIODOS)) todos.push({ nome: p.nome, engano: p.engano, cmd: 'periodo' + k })
    for (const [k, e] of Object.entries(B.EVENTOS)) todos.push({ nome: e.nome + ' (' + e.ano + ')', engano: e.engano, cmd: 'evento' + k })
    const inicio = Math.max(0, (parseInt(args[0], 10) || 1) - 1) * 6
    const pagina = todos.slice(inicio, inicio + 6)
    if (!pagina.length) return reply('🧠 Página vazia. Total de ' + Math.ceil(todos.length / 6) + ' páginas.')
    let doc = cab('O QUE A GENTE ERRA', '🧠')
    doc += linha('Página', Math.floor(inicio / 6) + 1 + ' de ' + Math.ceil(todos.length / 6))
    doc += sep()
    for (const t of pagina) {
        doc += '❌ *' + t.nome + '*\n' + t.engano + '\n📖 `' + prefix + t.cmd + '`\n\n'
    }
    doc += '➡️ _Próxima página:_ `' + prefix + 'mitoshistoria ' + (Math.floor(inicio / 6) + 2) + '`'
    return reply(doc)
    }
}
