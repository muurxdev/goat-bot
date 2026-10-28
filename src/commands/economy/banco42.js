/**
 * Comando .bancoguardar — GUARDAR UMA FATIA
 *
 * Calcula quanto depositar seguindo um percentual.
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
    name: 'bancoguardar',
    aliases: ["guardarpercentual","cmd_bancoguardar","alt_bancoguardar","atalho_bancoguardar","abrev_bancoguardar","call_bancoguardar","func_bancoguardar"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Calcula quanto depositar seguindo um percentual',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const pct = Math.min(100, Math.max(1, parseInt(args[0], 10) || 30))
    const p = B.patrimonio(user)
    const valor = Math.floor(p.carteira * (pct / 100))
    let doc = cab('GUARDAR UMA FATIA', '🪙')
    doc += linha('Na carteira', B.moeda(p.carteira))
    doc += linha('Guardar', pct + '%')
    doc += sep()
    doc += linha('Depositar', B.moeda(valor))
    doc += linha('Sobra na carteira', B.moeda(p.carteira - valor))
    if (valor > 0) doc += '\n📌 Execute com: `' + prefix + 'banco depositar ' + valor + '`'
    return reply(doc)
    }
}
