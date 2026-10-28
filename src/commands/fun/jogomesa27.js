/**
 * Comando .jogospara — O QUE DÁ PARA JOGAR
 *
 * Diz quais jogos funcionam com um número de pessoas.
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
    name: 'jogospara',
    aliases: ["quantosjogam","jogoscom"],
    category: 'fun',
    subcategory: 'Jogos de Mesa',
    description: 'Diz quais jogos funcionam com um número de pessoas',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const n = parseInt(args[0], 10)
    const lista = T.paraJogadores(n)
    if (!lista) {
        let doc = cab('O QUE DÁ PARA JOGAR', '👥')
        doc += '📌 Uso: `' + prefix + 'jogospara <quantas pessoas>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'jogospara 5`\n\n'
        doc += '_A lotação de cada jogo é declarada, não deduzida do texto: truco não aparece para 3 pessoas porque 3 não é partida válida._'
        return reply(doc)
    }
    if (!lista.length) {
        return reply(cab('O QUE DÁ PARA JOGAR', '👥') + '😕 Nenhum jogo do catálogo funciona com ' + n + (n === 1 ? ' pessoa' : ' pessoas') + '.\n\n🎮 _Ver todos:_ `' + prefix + 'jogosdemesa`')
    }
    const porTipo = {}
    for (const j of lista) {
        const t = T.tipoDe(j)
        if (!porTipo[t]) porTipo[t] = []
        porTipo[t].push(j)
    }
    let doc = cab('COM ' + n + (n === 1 ? ' PESSOA' : ' PESSOAS'), '👥')
    doc += linha('Opções', String(lista.length)) + '\n'
    for (const [k, js] of Object.entries(porTipo)) {
        const t = T.TIPOS[k]
        doc += bloco(t.emoji + ' ' + t.nome.toUpperCase(), js.map(j => j.nome + ' (' + j.duracao + ') `' + prefix + NOME_CMD[j.chave] + '`'))
    }
    return reply(doc)
    }
}
