/**
 * Comando .conceitosfinanceiros — CONCEITOS FINANCEIROS
 *
 * Todos os conceitos explicados, por área.
 */

const F = require('../../services/financeService')

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
    name: 'conceitosfinanceiros',
    aliases: ["glossariofinanceiro"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Todos os conceitos explicados, por área',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porArea = {}
    for (const [k, c] of Object.entries(F.CONCEITOS)) {
        if (!porArea[c.area]) porArea[c.area] = []
        porArea[c.area].push({ chave: k, ...c })
    }
    let doc = cab('CONCEITOS FINANCEIROS', '📚')
    doc += linha('Conceitos', String(Object.keys(F.CONCEITOS).length))
    doc += linha('Áreas', String(Object.keys(porArea).length)) + '\n'
    for (const [area, lista] of Object.entries(porArea)) {
        doc += bloco(area.toUpperCase(), lista.map(c => c.nome + ' `' + prefix + 'conceito' + c.chave + '`'))
    }
    doc += '\n🏦 _Produtos:_ `' + prefix + 'produtosfinanceiros`'
    return reply(doc)
    }
}
