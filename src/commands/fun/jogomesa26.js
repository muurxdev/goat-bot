/**
 * Comando .jogosdemesa — JOGOS DE MESA
 *
 * Todos os jogos catalogados, por tipo.
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
    name: 'jogosdemesa',
    aliases: ["jogos","listadejogos"],
    category: 'fun',
    subcategory: 'Jogos de Mesa',
    description: 'Todos os jogos catalogados, por tipo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('JOGOS DE MESA', '🎮')
    doc += linha('Jogos', String(Object.keys(T.JOGOS).length))
    doc += linha('Tipos', String(Object.keys(T.TIPOS).length)) + '\n'
    for (const [k, t] of Object.entries(T.TIPOS)) {
        const lista = T.porTipo(k)
        if (!lista.length) continue
        doc += bloco(t.emoji + ' ' + t.nome.toUpperCase() + ' (' + lista.length + ')',
            lista.map(j => j.nome + ' — ' + j.jogadores + ' `' + prefix + NOME_CMD[j.chave] + '`'))
    }
    doc += '\n👥 _Filtrar pelo tamanho do grupo:_ `' + prefix + 'jogospara 5`\n'
    doc += '⚔️ _Só as regras que geram briga:_ `' + prefix + 'regrasdiscutidas`'
    return reply(doc)
    }
}
