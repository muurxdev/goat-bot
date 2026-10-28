/**
 * Comando .apostacomparar — COMPARAR DOIS JOGOS
 *
 * Coloca dois jogos lado a lado.
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
    name: 'apostacomparar',
    aliases: ["compararjogos","cmd_apostacomparar","alt_apostacomparar","atalho_apostacomparar","abrev_apostacomparar","call_apostacomparar","func_apostacomparar"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Coloca dois jogos lado a lado',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const a = A.JOGOS[String(args[0] || '').toLowerCase()]
    const b = A.JOGOS[String(args[1] || '').toLowerCase()]
    if (!a || !b) return reply('⚔️ 📌 Uso: `' + prefix + 'apostacomparar roleta slots`\n\nJogos: ' + Object.keys(A.JOGOS).join(', '))
    let doc = cab('COMPARAR DOIS JOGOS', '⚔️')
    for (const j of [a, b]) {
        doc += '┃ *' + j.nome + '*\n'
        doc += '┃   chance ' + (j.chance * 100).toFixed(1) + '% · paga ' + j.retorno + 'x\n'
        doc += '┃   valor esperado ' + (A.valorEsperado(j.chance, j.retorno) * 100).toFixed(1) + '% · risco ' + j.risco + '\n\n'
    }
    const melhor = A.valorEsperado(a.chance, a.retorno) >= A.valorEsperado(b.chance, b.retorno) ? a : b
    doc += sep() + linha('Menos ruim', melhor.nome)
    return reply(doc)
    }
}
