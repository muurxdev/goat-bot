/**
 * Comando .bancoconta — DADOS DA CONTA
 *
 * Identificação e situação da sua conta.
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
    name: 'bancoconta',
    aliases: ["minhaconta","cmd_bancoconta","alt_bancoconta","atalho_bancoconta","abrev_bancoconta","call_bancoconta","func_bancoconta"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Identificação e situação da sua conta',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const prefs = B.lerPreferencias(user)
    const p = B.patrimonio(user)
    const f = B.fluxo(sender, 30)
    let doc = cab('DADOS DA CONTA', '🪪')
    doc += linha('Titular', user.displayNick || user.name || 'Cavaleiro sem nome')
    if (prefs.apelido) doc += linha('Apelido da conta', prefs.apelido)
    doc += linha('Patente', require('../../utils/helpers').getCargo(user.level || 1))
    doc += linha('Patrimônio', B.moeda(p.total))
    doc += linha('Movimentações (30d)', String(f.movimentacoes))
    if (prefs.meta) doc += linha('Meta ativa', B.moeda(prefs.meta))
    doc += linha('Situação', prefs.trancadoAte > Date.now() ? '🔒 Saques trancados' : '🟢 Ativa')
    return reply(doc)
    }
}
