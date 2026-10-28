/**
 * Comando .bancoglossario — GLOSSÁRIO DA TESOURARIA
 *
 * O que cada termo do banco significa.
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
    name: 'bancoglossario',
    aliases: ["termosbanco","cmd_bancoglossario","alt_bancoglossario","atalho_bancoglossario","abrev_bancoglossario","call_bancoglossario","func_bancoglossario"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'O que cada termo do banco significa',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    let doc = cab('GLOSSÁRIO DA TESOURARIA', '📚')
    const termos = [
        ['Patrimônio', 'tudo somado: carteira + banco + cofre'],
        ['Liquidez', 'quanto está disponível para gastar agora'],
        ['Rendimento', 'moedas que nascem sozinhas do que está guardado'],
        ['Taxa de poupança', 'percentual do que entra e você consegue reter'],
        ['Autonomia', 'quantos dias seu dinheiro dura no ritmo atual'],
        ['Percentil', 'quantos Cavaleiros têm menos que você'],
        ['Reserva', 'o que separar para aguentar um mês ruim']
    ]
    for (const [t, d] of termos) doc += '┃ *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
