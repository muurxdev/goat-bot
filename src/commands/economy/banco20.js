/**
 * Comando .bancoorcamento — ORÇAMENTO SUGERIDO
 *
 * Divisão recomendada do que você ganha.
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
    name: 'bancoorcamento',
    aliases: ["orcamento","cmd_bancoorcamento","alt_bancoorcamento","atalho_bancoorcamento","abrev_bancoorcamento","call_bancoorcamento","func_bancoorcamento"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Divisão recomendada do que você ganha',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const f = B.fluxo(sender, 30)
    const base = f.entrou || B.patrimonio(user).total
    let doc = cab('ORÇAMENTO SUGERIDO', '📊')
    if (!base) return reply(doc + '_Sem entradas registradas para calcular._')
    doc += linha('Base de cálculo', B.moeda(base))
    doc += sep()
    doc += '┃ 🛡️ Reserva (30%)  ' + B.moeda(base * 0.30) + '\n'
    doc += '┃ ⚔️ Equipamento (40%) ' + B.moeda(base * 0.40) + '\n'
    doc += '┃ 🎲 Diversão (20%)  ' + B.moeda(base * 0.20) + '\n'
    doc += '┃ 💎 Cofre (10%)     ' + B.moeda(base * 0.10) + '\n'
    return reply(doc)
    }
}
