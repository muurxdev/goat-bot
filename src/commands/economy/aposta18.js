/**
 * Comando .apostavariancia — VARIAÇÃO DO JOGO
 *
 * O quanto o resultado balança em cada jogo.
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
    name: 'apostavariancia',
    aliases: ["riscovariacao","cmd_apostavariancia","alt_apostavariancia","atalho_apostavariancia","abrev_apostavariancia","call_apostavariancia","func_apostavariancia"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'O quanto o resultado balança em cada jogo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('VARIAÇÃO DO JOGO', '🌊')
    const lista = Object.entries(A.JOGOS)
        .map(([k, j]) => ({ j, dp: A.desvio(j.chance, j.retorno) }))
        .sort((a, b) => a.dp - b.dp)
    for (const x of lista) doc += '┃ ' + x.j.nome.padEnd(16) + x.dp.toFixed(2) + ' · ' + x.j.risco + '\n'
    doc += '\n_Quanto maior o número, mais o resultado oscila: ganhos maiores e perdas maiores._'
    return reply(doc)
    }
}
