/**
 * Comando .jogosdetabuleiro — JOGOS DE TABULEIRO
 *
 * Jogos de tabuleiro.
 */

const T = require('../../services/tableGamesService')
const NOME_CMD = {"truco":"jogotruco","buraco":"jogoburaco","canastra":"jogocanastra","pife":"jogopife","sueca":"jogosueca","bisca":"jogobisca","poker":"jogopoker","domino":"jogodomino","uno":"jogouno","war":"jogowar","damas":"regrasdamas","xadrezjogo":"jogoxadrezjogo","jogodavelha":"jogojogodavelha","forca":"jogoforca","stop":"jogostop","banco":"jogobanco","dominoDeMesa":"jogodominodemesa","imagemeacao":"jogoimagemeacao","mimica":"jogomimica","verdadedesafio":"jogoverdadedesafio"}

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


module.exports = {
    name: 'jogosdetabuleiro',
    aliases: ["listajogostabuleiro"],
    category: 'fun',
    subcategory: 'Jogos de Mesa',
    description: 'Jogos de tabuleiro',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const t = T.TIPOS['tabuleiro']
    const lista = T.porTipo('tabuleiro')
    let doc = cab("JOGOS DE TABULEIRO", t.emoji)
    doc += linha('Jogos', String(lista.length)) + '\n'
    for (const j of lista) {
        doc += '┃ *' + j.nome + '*\n┃    ' + j.jogadores + ' · ' + j.duracao + '\n┃    `' + prefix + NOME_CMD[j.chave] + '`\n'
    }
    doc += '\n🎮 _Todos os jogos:_ `' + prefix + 'jogosdemesa`'
    return reply(doc)
    }
}
