/**
 * Comando .bancopordia — MOVIMENTO POR DIA
 *
 * Entradas e saídas dia a dia.
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
    name: 'bancopordia',
    aliases: ["movimentodiario","cmd_bancopordia","alt_bancopordia","atalho_bancopordia","abrev_bancopordia","call_bancopordia","func_bancopordia"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Entradas e saídas dia a dia',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const dias = B.porDia(sender, 14)
    let doc = cab('MOVIMENTO POR DIA', '📆')
    if (!dias.length) return reply(doc + vazio())
    for (const d of dias) {
        const data = d.dia.split('-').reverse().slice(0, 2).join('/')
        doc += '┃ ' + data + '  +' + Math.round(d.entradas).toLocaleString('pt-BR') + '  -' + Math.round(d.saidas).toLocaleString('pt-BR') + '\n'
    }
    doc += '\n_Últimos 14 dias com movimento._'
    return reply(doc)
    }
}
