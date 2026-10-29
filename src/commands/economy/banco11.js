/**
 * Comando .bancosaldohistorico — EVOLUÇÃO DO SALDO
 *
 * Como o saldo mudou nas últimas movimentações.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')

function cab(titulo, emoji) {
    return `╔══════════════════════════════╗\n║   ${emoji} *${titulo}*\n╚══════════════════════════════╝\n\n`
}
function linha(rotulo, valor) { return `┃ *${rotulo}:* ${valor}\n` }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function vazio() { return '_Nenhuma movimentação registrada ainda._\n\nAs movimentações aparecem aqui conforme você deposita, saca e transfere.' }
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    const cheios = Math.round(f * 20)
    return '[' + '█'.repeat(cheios) + '░'.repeat(20 - cheios) + '] ' + (f * 100).toFixed(0) + '%'
}
function fatia(rotulo, fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '┃ ' + rotulo.padEnd(10) + '█'.repeat(Math.round(f * 12)).padEnd(12) + (f * 100).toFixed(1) + '%\n'
}
function movimento(l) {
    const entrada = B.ehEntrada(l)
    const data = String(l.created_at || '').slice(5, 16).replace('-', '/')
    return '┃ ' + (entrada ? '📥' : '📤') + ' ' + data + '  ' + (entrada ? '+' : '-') + B.moeda(Math.abs(Number(l.amount) || 0)) + '\n'
}

module.exports = {
    name: 'bancosaldohistorico',
    aliases: ["evolucaosaldo","cmd_bancosaldohistorico","alt_bancosaldohistorico","atalho_bancosaldohistorico","abrev_bancosaldohistorico","call_bancosaldohistorico","func_bancosaldohistorico"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Como o saldo mudou nas últimas movimentações',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const linhas = B.razao(sender, { limite: 12 }).reverse()
    let doc = cab('EVOLUÇÃO DO SALDO', '📈')
    if (!linhas.length) return reply(doc + vazio())
    let anterior = null
    for (const l of linhas) {
        const saldo = Number(l.balance_after) || 0
        const seta = anterior === null ? '  ' : saldo > anterior ? '🔼' : saldo < anterior ? '🔽' : '➡️'
        doc += '┃ ' + seta + ' ' + String(l.created_at || '').slice(5, 10) + ' → ' + B.moeda(saldo) + '\n'
        anterior = saldo
    }
    return reply(doc)
    }
}
