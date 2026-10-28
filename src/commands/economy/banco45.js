/**
 * Comando .bancoresumoanual — BALANÇO DO ANO
 *
 * Resultado consolidado dos últimos 365 dias.
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
    name: 'bancoresumoanual',
    aliases: ["balancoanual","cmd_bancoresumoanual","alt_bancoresumoanual","atalho_bancoresumoanual","abrev_bancoresumoanual","call_bancoresumoanual","func_bancoresumoanual"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Resultado consolidado dos últimos 365 dias',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const f = B.fluxo(sender, 365)
    let doc = cab('BALANÇO DO ANO', '🏛️')
    if (!f.movimentacoes) return reply(doc + vazio())
    doc += linha('Movimentações', String(f.movimentacoes))
    doc += linha('Entrou no ano', B.moeda(f.entrou))
    doc += linha('Saiu no ano', B.moeda(f.saiu))
    doc += sep()
    doc += linha('Resultado', (f.saldo >= 0 ? '🟢 +' : '🔴 ') + B.moeda(f.saldo))
    doc += linha('Média mensal', B.moeda(f.entrou / 12) + ' de entrada')
    return reply(doc)
    }
}
