/**
 * Comando .bancosimularemprestimo — SIMULADOR DE EMPRÉSTIMO
 *
 * Mostra o custo real de pegar emprestado.
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
    name: 'bancosimularemprestimo',
    aliases: ["simularemprestimo","cmd_bancosimularemprestimo","alt_bancosimularemprestimo","atalho_bancosimularemprestimo","abrev_bancosimularemprestimo","call_bancosimularemprestimo","func_bancosimularemprestimo"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Mostra o custo real de pegar emprestado',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const valor = parseInt(String(args[0] || '').replace(/\D/g, ''), 10)
    const parcelas = parseInt(args[1], 10) || 5
    if (!valor) return reply('📋 *Simulador de empréstimo*\n\n📌 Uso: `' + prefix + 'bancosimularemprestimo <valor> [parcelas]`')
    const r = B.simularEmprestimo(valor, parcelas)
    let doc = cab('SIMULADOR DE EMPRÉSTIMO', '📋')
    doc += linha('Você pega', B.moeda(r.valor))
    doc += linha('Taxa do Reino', (r.taxa * 100).toFixed(0) + '%')
    doc += linha('Parcelas', String(r.parcelas))
    doc += sep()
    doc += linha('Cada parcela', B.moeda(r.porParcela))
    doc += linha('Você devolve', B.moeda(r.total))
    doc += linha('Custo dos juros', B.moeda(r.juros))
    return reply(doc)
    }
}
