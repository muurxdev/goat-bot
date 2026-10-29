/**
 * Comando .bancoextratotxt — EXTRATO PARA COPIAR
 *
 * Extrato em texto simples, fácil de copiar.
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
    name: 'bancoextratotxt',
    aliases: ["extratotexto","cmd_bancoextratotxt","alt_bancoextratotxt","atalho_bancoextratotxt","abrev_bancoextratotxt","call_bancoextratotxt","func_bancoextratotxt"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Extrato em texto simples, fácil de copiar',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const linhas = B.razao(sender, { limite: 20 })
    if (!linhas.length) return reply(cab('EXTRATO PARA COPIAR', '📄') + vazio())
    let doc = cab('EXTRATO PARA COPIAR', '📄')
    doc += '```\n'
    doc += 'DATA        TIPO            VALOR\n'
    for (const l of linhas) {
        const data = String(l.created_at || '').slice(0, 10)
        const tipo = String(l.type || '?').slice(0, 14).padEnd(15)
        const sinal = B.ehEntrada(l) ? '+' : '-'
        doc += data + '  ' + tipo + sinal + Math.abs(Number(l.amount) || 0) + '\n'
    }
    doc += '```'
    return reply(doc)
    }
}
