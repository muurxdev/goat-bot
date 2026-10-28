/**
 * Comando .bancotrancar — TRANCAR SAQUES
 *
 * Impede você mesmo de sacar por um período.
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
    name: 'bancotrancar',
    aliases: ["travarsaques","cmd_bancotrancar","alt_bancotrancar","atalho_bancotrancar","abrev_bancotrancar","call_bancotrancar","func_bancotrancar"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Impede você mesmo de sacar por um período',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const horas = Math.min(720, Math.max(1, parseInt(args[0], 10) || 24))
    const ate = Date.now() + horas * 3600000
    B.salvarPreferencia(user, 'bancoTrancadoAte', ate)
    let doc = cab('TRANCAR SAQUES', '🔒')
    doc += linha('Trancado por', horas + ' horas')
    doc += linha('Liberado em', new Date(ate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
    doc += '\n_Trave o próprio cofre quando a tentação de gastar for maior que a vontade de guardar._'
    return reply(doc)
    }
}
