/**
 * Comando .bancoevolucao — VARIAÇÃO RECENTE
 *
 * Comparação entre esta semana e a anterior.
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
    name: 'bancoevolucao',
    aliases: ["variacao","cmd_bancoevolucao","alt_bancoevolucao","atalho_bancoevolucao","abrev_bancoevolucao","call_bancoevolucao","func_bancoevolucao"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Comparação entre esta semana e a anterior',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const semana = B.fluxo(sender, 7)
    const mes = B.fluxo(sender, 30)
    let doc = cab('VARIAÇÃO RECENTE', '📉')
    if (!mes.movimentacoes) return reply(doc + vazio())
    const mediaMes = mes.saiu / 30
    const mediaSemana = semana.saiu / 7
    doc += linha('Gasto médio no mês', B.moeda(mediaMes))
    doc += linha('Gasto médio na semana', B.moeda(mediaSemana))
    const variacao = mediaMes ? ((mediaSemana - mediaMes) / mediaMes) * 100 : 0
    doc += sep() + linha('Variação', (variacao >= 0 ? '🔺 +' : '🔻 ') + variacao.toFixed(1) + '%')
    doc += '\n_' + (variacao > 20 ? 'Você está gastando bem mais que o normal.' : variacao < -20 ? 'Você segurou os gastos.' : 'Ritmo estável.') + '_'
    return reply(doc)
    }
}
