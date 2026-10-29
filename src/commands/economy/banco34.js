/**
 * Comando .bancoajuda — GUIA DA TESOURARIA
 *
 * Todos os comandos do sistema bancário.
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
    name: 'bancoajuda',
    aliases: ["guiabanco","cmd_bancoajuda","alt_bancoajuda","atalho_bancoajuda","abrev_bancoajuda","call_bancoajuda","func_bancoajuda"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Todos os comandos do sistema bancário',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    let doc = cab('GUIA DA TESOURARIA', '🗺️')
    doc += '╭━〔 👁️ CONSULTA 〕━⬣\n'
    doc += '┃ `' + prefix + 'bancoresumo` · `' + prefix + 'bancorazao`\n'
    doc += '┃ `' + prefix + 'bancoentradas` · `' + prefix + 'bancosaidas`\n'
    doc += '┃ `' + prefix + 'bancoportipo` · `' + prefix + 'bancopordia`\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '╭━〔 🧮 PLANEJAMENTO 〕━⬣\n'
    doc += '┃ `' + prefix + 'bancometa` · `' + prefix + 'bancoprojecao`\n'
    doc += '┃ `' + prefix + 'bancosimularjuros` · `' + prefix + 'bancoreserva`\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '╭━〔 🔍 ANÁLISE 〕━⬣\n'
    doc += '┃ `' + prefix + 'bancosaude` · `' + prefix + 'bancoautonomia`\n'
    doc += '┃ `' + prefix + 'bancoliquidez` · `' + prefix + 'bancopercentil`\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣'
    return reply(doc)
    }
}
