/**
 * Comando .apostahistorico — HISTÓRICO DE APOSTAS
 *
 * Suas últimas rodadas registradas.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function semDados(prefix) {
    return '_Nenhuma aposta registrada ainda._\n\nJogue alguma rodada e volte aqui — as análises usam o seu histórico real.'
}
function jogoDe(args) {
    const chave = String(args[0] || '').toLowerCase()
    return A.JOGOS[chave] ? { chave, ...A.JOGOS[chave] } : null
}
function listaDeJogos(prefix, cmd) {
    return '🎲 Informe um jogo.\n\n📌 Exemplo: `' + prefix + cmd + ' roleta`\n\nDisponíveis: ' + Object.keys(A.JOGOS).join(', ')
}

module.exports = {
    name: 'apostahistorico',
    aliases: ["historicoapostas","cmd_apostahistorico","alt_apostahistorico","atalho_apostahistorico","abrev_apostahistorico","call_apostahistorico","func_apostahistorico"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Suas últimas rodadas registradas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const h = A.historico(sender, { limite: 15 })
    let doc = cab('HISTÓRICO DE APOSTAS', '📜')
    if (!h.length) return reply(doc + semDados(prefix))
    for (const l of h) {
        const v = Number(l.amount) || 0
        doc += '┃ ' + (v >= 0 ? '🟢' : '🔴') + ' ' + String(l.created_at || '').slice(5, 16) + ' ' + (v >= 0 ? '+' : '') + A.moeda(v) + '\n'
    }
    return reply(doc)
    }
}
