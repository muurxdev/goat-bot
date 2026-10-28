/**
 * Comando .bestiario — BESTIÁRIO
 *
 * Todas as criaturas mitológicas por origem.
 */

const M = require('../../services/mythologyService')

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
    name: 'bestiario',
    aliases: ["criaturas"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Todas as criaturas mitológicas por origem',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const entradas = Object.entries(M.CRIATURAS).filter(([, c]) => !filtro || c.origem.toLowerCase().includes(filtro))
    if (!entradas.length) return reply('🐉 Nenhuma criatura de origem `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'bestiario`')
    const porOrigem = {}
    for (const [k, c] of entradas) {
        if (!porOrigem[c.origem]) porOrigem[c.origem] = []
        porOrigem[c.origem].push({ chave: k, ...c })
    }
    let doc = cab('BESTIÁRIO', '🐉')
    doc += linha('Criaturas', String(entradas.length)) + '\n'
    for (const [origem, lista] of Object.entries(porOrigem)) {
        doc += bloco(origem.toUpperCase(), lista.map(c => c.nome + ' (' + c.perigo + ') `' + prefix + 'criatura' + c.chave + '`'))
    }
    doc += '\n💡 _Filtrar por origem:_ `' + prefix + 'bestiario brasileira`'
    return reply(doc)
    }
}
