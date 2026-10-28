/**
 * Comando .capitais — CAPITAIS
 *
 * A capital de cada país do catálogo.
 */

const K = require('../../services/knowledgeService')

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

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }

module.exports = {
    name: 'capitais',
    aliases: ["listacapitais"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'A capital de cada país do catálogo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = Object.values(K.PAISES).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    const pagina = Math.max(1, parseInt(args[0], 10) || 1)
    const porPagina = 25
    const total = Math.ceil(lista.length / porPagina)
    let doc = cab('CAPITAIS', '🏛️')
    doc += linha('Página', pagina + ' de ' + total) + '\n'
    for (const p of lista.slice((pagina - 1) * porPagina, pagina * porPagina)) {
        doc += '┃ ' + p.nome + ' → ' + p.capital + '\n'
    }
    if (pagina < total) doc += '\n💡 _Próxima:_ `' + prefix + 'capitais ' + (pagina + 1) + '`'
    return reply(doc)
    }
}
