/**
 * Comando .bancosaude — SAÚDE FINANCEIRA
 *
 * Nota da sua situação com base em dados reais.
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
    name: 'bancosaude',
    aliases: ["saudefinanceira","cmd_bancosaude","alt_bancosaude","atalho_bancosaude","abrev_bancosaude","call_bancosaude","func_bancosaude"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Nota da sua situação com base em dados reais',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const p = B.patrimonio(user)
    const f = B.fluxo(sender, 30)
    let nota = 0
    const criterios = []
    const guardado = p.banco + p.cofre
    const pctGuardado = p.total ? guardado / p.total : 0
    if (pctGuardado >= 0.5) { nota += 30; criterios.push('🟢 Maior parte protegida') } else criterios.push('🔴 Pouco protegido')
    if (f.taxaDePoupanca >= 20) { nota += 30; criterios.push('🟢 Retém bem o que ganha') } else if (f.taxaDePoupanca > 0) { nota += 15; criterios.push('🟡 Retém pouco') } else criterios.push('🔴 Não retém nada')
    if (p.cofre > 0) { nota += 20; criterios.push('🟢 Tem cofre') } else criterios.push('🔴 Cofre vazio')
    if (p.total > 0) { nota += 20; criterios.push('🟢 Tem patrimônio') }
    let doc = cab('SAÚDE FINANCEIRA', '💚')
    doc += linha('Nota', nota + '/100')
    doc += '\n' + barra(nota / 100) + '\n\n'
    for (const c of criterios) doc += '┃ ' + c + '\n'
    return reply(doc)
    }
}
