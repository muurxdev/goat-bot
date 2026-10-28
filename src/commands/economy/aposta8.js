/**
 * Comando .apostajogos — DESEMPENHO POR JOGO
 *
 * Qual jogo te trata melhor e qual te trata pior.
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
    name: 'apostajogos',
    aliases: ["apostasporjogo","cmd_apostajogos","alt_apostajogos","atalho_apostajogos","abrev_apostajogos","call_apostajogos","func_apostajogos"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Qual jogo te trata melhor e qual te trata pior',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const j = A.porJogo(sender)
    let doc = cab('DESEMPENHO POR JOGO', '🎲')
    if (!j.length) return reply(doc + semDados(prefix))
    for (const x of j) {
        const nome = A.JOGOS[x.jogo]?.nome || x.jogo
        doc += '┃ ' + nome.padEnd(16) + x.rodadas + 'x · ' + (x.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(x.saldo) + '\n'
    }
    return reply(doc)
    }
}
