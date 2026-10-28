/**
 * Comando .conceitoorcamento503020 — REGRA 50/30/20
 *
 * Conceito financeiro: Regra 50/30/20.
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
    name: 'conceitoorcamento503020',
    aliases: ["oqueeorcamento503020"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Conceito financeiro: Regra 50/30/20',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = F.CONCEITOS['orcamento503020']
    let doc = cab("REGRA 50/30/20", '📘')
    doc += linha('Área', c.area)
    if (c.formula !== '—') doc += linha('Fórmula', c.formula)
    doc += sep()
    doc += '📖 *O que é*\n' + c.oquee + '\n\n'
    doc += '⚠️ *O erro mais comum*\n' + c.erro
    doc += '\n\n📚 _Todos os conceitos:_ `' + prefix + 'conceitosfinanceiros`'
    return reply(doc)
    }
}
