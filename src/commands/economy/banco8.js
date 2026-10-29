/**
 * Comando .bancosemana — FECHAMENTO DA SEMANA
 *
 * Resultado dos últimos 7 dias.
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
    name: 'bancosemana',
    aliases: ["fechamentosemana","cmd_bancosemana","alt_bancosemana","atalho_bancosemana","abrev_bancosemana","call_bancosemana","func_bancosemana"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Resultado dos últimos 7 dias',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const f = B.fluxo(sender, 7)
    let doc = cab('FECHAMENTO DA SEMANA', '📅')
    doc += linha('Movimentações', String(f.movimentacoes))
    doc += linha('Entrou', B.moeda(f.entrou))
    doc += linha('Saiu', B.moeda(f.saiu))
    doc += sep()
    doc += linha('Resultado', (f.saldo >= 0 ? '🟢 +' : '🔴 ') + B.moeda(f.saldo))
    doc += linha('Gasto médio por dia', B.moeda(f.mediaDiariaGasta))
    return reply(doc)
    }
}
