/**
 * Comando .bancorisco — EXPOSIÇÃO AO RISCO
 *
 * Quanto do seu patrimônio pode ser perdido.
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
    name: 'bancorisco',
    aliases: ["exposicao","cmd_bancorisco","alt_bancorisco","atalho_bancorisco","abrev_bancorisco","call_bancorisco","func_bancorisco"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto do seu patrimônio pode ser perdido',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const p = B.patrimonio(user)
    let doc = cab('EXPOSIÇÃO AO RISCO', '⚠️')
    if (!p.total) return reply(doc + '_Sem patrimônio a arriscar._')
    doc += linha('Em risco (carteira)', B.moeda(p.carteira))
    doc += linha('Protegido (banco)', B.moeda(p.banco))
    doc += linha('Blindado (cofre)', B.moeda(p.cofre))
    const risco = (p.carteira / p.total) * 100
    doc += sep() + linha('Grau de risco', risco.toFixed(0) + '%')
    doc += '\n' + barra(risco / 100)
    doc += '\n_Só a carteira pode ser levada num assalto._'
    return reply(doc)
    }
}
