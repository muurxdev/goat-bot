/**
 * Comando .bancoparcelas — CÁLCULO DE PARCELAS
 *
 * Divide um valor em parcelas com juros.
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
    name: 'bancoparcelas',
    aliases: ["calcularparcelas","cmd_bancoparcelas","alt_bancoparcelas","atalho_bancoparcelas","abrev_bancoparcelas","call_bancoparcelas","func_bancoparcelas"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Divide um valor em parcelas com juros',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const valor = parseInt(String(args[0] || '').replace(/\D/g, ''), 10)
    if (!valor) return reply('➗ 📌 Uso: `' + prefix + 'bancoparcelas <valor>`')
    let doc = cab('CÁLCULO DE PARCELAS', '➗')
    doc += linha('Valor', B.moeda(valor))
    doc += sep()
    for (const n of [2, 3, 5, 10, 12]) {
        const r = B.simularEmprestimo(valor, n)
        doc += '┃ ' + String(n + 'x').padEnd(5) + B.moeda(r.porParcela).padEnd(18) + 'total ' + B.moeda(r.total) + '\n'
    }
    return reply(doc)
    }
}
