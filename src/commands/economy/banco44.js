/**
 * Comando .bancocustooportunidade — CUSTO DE OPORTUNIDADE
 *
 * Quanto você deixa de ganhar com moedas paradas.
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
    name: 'bancocustooportunidade',
    aliases: ["custooportunidade","cmd_bancocustooportunidade","alt_bancocustooportunidade","atalho_bancocustooportunidade","abrev_bancocustooportunidade","call_bancocustooportunidade","func_bancocustooportunidade"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto você deixa de ganhar com moedas paradas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const p = B.patrimonio(user)
    let doc = cab('CUSTO DE OPORTUNIDADE', '🤔')
    if (p.carteira <= 0) return reply(doc + '_Sua carteira está vazia — nada parado._')
    doc += linha('Parado na carteira', B.moeda(p.carteira))
    doc += sep()
    for (const d of [7, 30, 365]) {
        const perdido = B.jurosCompostos(p.carteira, d).rendimento
        doc += '┃ Em ' + String(d + 'd').padEnd(6) + 'deixa de ganhar ' + B.moeda(perdido) + '\n'
    }
    doc += '\n_Moeda na carteira não rende e ainda pode ser roubada._'
    return reply(doc)
    }
}
