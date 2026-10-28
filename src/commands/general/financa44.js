/**
 * Comando .produtosfinanceiros — PRODUTOS FINANCEIROS
 *
 * Todos os produtos com risco, liquidez e tributação.
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
    name: 'produtosfinanceiros',
    aliases: ["ondeinvestir"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Todos os produtos com risco, liquidez e tributação',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const entradas = Object.entries(F.PRODUTOS).filter(([, p]) => !filtro || p.tipo.toLowerCase().includes(filtro) || p.risco.toLowerCase().includes(filtro))
    if (!entradas.length) return reply('🏦 Nada com `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'produtosfinanceiros`')
    let doc = cab('PRODUTOS FINANCEIROS', '🏦')
    doc += linha('Produtos', String(entradas.length)) + '\n'
    for (const [k, p] of entradas) {
        doc += '┃ *' + p.nome + '* — risco ' + p.risco + '\n'
        doc += '┃    ' + p.tipo + ' · liquidez ' + p.liquidez + '\n'
        doc += '┃    `' + prefix + 'produto' + k + '`\n'
    }
    doc += '\n_Cada ficha traz como funciona e onde costuma decepcionar._\n'
    doc += '_Descrição de funcionamento, não recomendação de compra._'
    return reply(doc)
    }
}
