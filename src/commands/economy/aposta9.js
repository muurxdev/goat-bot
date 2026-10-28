/**
 * Comando .apostafavorito — SEU JOGO FAVORITO
 *
 * Em qual jogo você mais aposta.
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
    name: 'apostafavorito',
    aliases: ["jogofavorito","cmd_apostafavorito","alt_apostafavorito","atalho_apostafavorito","abrev_apostafavorito","call_apostafavorito","func_apostafavorito"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Em qual jogo você mais aposta',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const j = A.porJogo(sender)
    let doc = cab('SEU JOGO FAVORITO', '⭐')
    if (!j.length) return reply(doc + semDados(prefix))
    const fav = j[0]
    const info = A.JOGOS[fav.jogo]
    doc += linha('Jogo', info?.nome || fav.jogo)
    doc += linha('Rodadas', String(fav.rodadas))
    doc += linha('Resultado', (fav.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(fav.saldo))
    if (info) doc += linha('Valor esperado', (A.valorEsperado(info.chance, info.retorno) * 100).toFixed(1) + '% por moeda')
    return reply(doc)
    }
}
