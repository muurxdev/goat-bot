/**
 * Comando .bancoregras — COMO FUNCIONA O BANCO
 *
 * As regras do dinheiro no Reino.
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
    name: 'bancoregras',
    aliases: ["comofuncionabanco","cmd_bancoregras","alt_bancoregras","atalho_bancoregras","abrev_bancoregras","call_bancoregras","func_bancoregras"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'As regras do dinheiro no Reino',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    let doc = cab('COMO FUNCIONA O BANCO', '📖')
    doc += '💰 *Carteira* — o que você carrega. Pode ser roubada em assaltos e é o que os comandos gastam primeiro.\n\n'
    doc += '🏦 *Banco* — protegido de roubo e rende ' + (B.RENDIMENTO_DIARIO * 100).toFixed(1) + '% ao dia. Guarde aqui o que não vai usar hoje.\n\n'
    doc += '🔐 *Cofre* — sobrevive até ao renascimento. É a única reserva que atravessa um reinício.\n\n'
    doc += '📖 *Livro-razão* — toda movimentação fica registrada. Use `' + prefix + 'bancorazao` para conferir.\n'
    return reply(doc)
    }
}
