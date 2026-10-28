/**
 * Comando .bancocomprovante — COMPROVANTE
 *
 * Detalhe de uma movimentação específica.
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
    name: 'bancocomprovante',
    aliases: ["recibo","cmd_bancocomprovante","alt_bancocomprovante","atalho_bancocomprovante","abrev_bancocomprovante","call_bancocomprovante","func_bancocomprovante"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Detalhe de uma movimentação específica',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const linhas = B.razao(sender, { limite: 50 })
    if (!linhas.length) return reply(cab('COMPROVANTE', '🧾') + vazio())
    const indice = Math.max(1, parseInt(args[0], 10) || 1)
    const l = linhas[indice - 1]
    if (!l) return reply('❌ Não existe movimentação número ' + indice + '. Você tem ' + linhas.length + ' registradas.')
    let doc = cab('COMPROVANTE', '🧾')
    doc += linha('Número', String(indice))
    doc += linha('Natureza', String(l.type || 'não informada'))
    doc += linha('Valor', B.moeda(Math.abs(Number(l.amount) || 0)))
    doc += linha('Sentido', B.ehEntrada(l) ? '📥 Entrada' : '📤 Saída')
    doc += linha('Saldo depois', B.moeda(l.balance_after))
    doc += linha('Quando', new Date(l.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
    if (l.description) doc += linha('Descrição', l.description)
    return reply(doc)
    }
}
