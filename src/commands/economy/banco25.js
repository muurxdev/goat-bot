/**
 * Comando .bancoliquidez — ONDE ESTÁ SEU DINHEIRO
 *
 * Proporção entre carteira, banco e cofre.
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
    name: 'bancoliquidez',
    aliases: ["ondeestaodinheiro","cmd_bancoliquidez","alt_bancoliquidez","atalho_bancoliquidez","abrev_bancoliquidez","call_bancoliquidez","func_bancoliquidez"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Proporção entre carteira, banco e cofre',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const p = B.patrimonio(user)
    let doc = cab('ONDE ESTÁ SEU DINHEIRO', '🧭')
    if (!p.total) return reply(doc + '_Você não tem moedas em lugar nenhum._')
    doc += fatia('Carteira', p.carteira / p.total)
    doc += fatia('Banco', p.banco / p.total)
    doc += fatia('Cofre', p.cofre / p.total)
    doc += sep()
    const exposto = p.carteira / p.total
    doc += linha('Exposto a roubo', (exposto * 100).toFixed(1) + '%')
    if (exposto > 0.5) doc += '\n🔴 _Mais da metade está na carteira, onde pode ser roubada._'
    return reply(doc)
    }
}
