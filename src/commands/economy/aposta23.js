/**
 * Comando .apostabanca — GESTÃO DA BANCA
 *
 * Quanto da sua banca arriscar com segurança.
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
    name: 'apostabanca',
    aliases: ["gestaobanca","cmd_apostabanca","alt_apostabanca","atalho_apostabanca","abrev_apostabanca","call_apostabanca","func_apostabanca"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Quanto da sua banca arriscar com segurança',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const banca = (Number(user.coins) || 0) + (Number(user.bank) || 0)
    let doc = cab('GESTÃO DA BANCA', '🏦')
    if (!banca) return reply(doc + '_Você não tem moedas para apostar._')
    doc += linha('Banca total', A.moeda(banca))
    doc += sep()
    doc += '┃ 🟢 Conservador (1%)  ' + A.moeda(banca * 0.01) + '\n'
    doc += '┃ 🟡 Moderado (3%)     ' + A.moeda(banca * 0.03) + '\n'
    doc += '┃ 🟠 Agressivo (5%)    ' + A.moeda(banca * 0.05) + '\n'
    doc += '┃ 🔴 Irresponsável (20%) ' + A.moeda(banca * 0.20) + '\n'
    doc += '\n_Regra prática: nunca arrisque numa rodada o que não pode perder inteiro._'
    return reply(doc)
    }
}
