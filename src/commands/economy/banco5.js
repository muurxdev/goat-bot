/**
 * Comando .bancoportipo — PARA ONDE FOI
 *
 * Movimentações agrupadas por natureza.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
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
    name: 'bancoportipo',
    aliases: ["gastosportipo","cmd_bancoportipo","alt_bancoportipo","atalho_bancoportipo","abrev_bancoportipo","call_bancoportipo","func_bancoportipo"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Movimentações agrupadas por natureza',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const tipos = B.porTipo(sender, 30)
    let doc = cab('PARA ONDE FOI', '🧾')
    if (!tipos.length) return reply(doc + vazio())
    const maior = tipos[0].valor || 1
    for (const t of tipos) {
        doc += '┃ ' + String(t.tipo).slice(0, 14).padEnd(15) + '█'.repeat(Math.max(1, Math.round(t.valor / maior * 10))) + ' ' + B.moeda(t.valor) + '\n'
    }
    doc += '\n_Últimos 30 dias._'
    return reply(doc)
    }
}
