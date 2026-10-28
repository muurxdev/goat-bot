/**
 * Comando .apostaexpectativa — VALOR ESPERADO
 *
 * Quanto cada jogo devolve por moeda, na média.
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
    name: 'apostaexpectativa',
    aliases: ["valoresperado","cmd_apostaexpectativa","alt_apostaexpectativa","atalho_apostaexpectativa","abrev_apostaexpectativa","call_apostaexpectativa","func_apostaexpectativa"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Quanto cada jogo devolve por moeda, na média',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('VALOR ESPERADO', '📉')
    const ordenados = Object.entries(A.JOGOS)
        .map(([k, j]) => ({ k, j, ve: A.valorEsperado(j.chance, j.retorno) }))
        .sort((a, b) => b.ve - a.ve)
    for (const x of ordenados) {
        doc += '┃ ' + x.j.nome.padEnd(16) + (x.ve * 100).toFixed(1) + '%\n'
    }
    doc += '\n_Todos negativos. Apostando 1.000 no melhor deles, a média devolve ' + A.moeda(1000 * (1 + ordenados[0].ve)) + '._'
    return reply(doc)
    }
}
