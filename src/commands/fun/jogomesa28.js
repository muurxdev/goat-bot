/**
 * Comando .regrasdiscutidas — AS REGRAS QUE GERAM BRIGA
 *
 * Só as regras disputadas de cada jogo, para resolver a discussão.
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
    name: 'regrasdiscutidas',
    aliases: ["brigasdejogo"],
    category: 'fun',
    subcategory: 'Jogos de Mesa',
    description: 'Só as regras disputadas de cada jogo, para resolver a discussão',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const pagina = Math.max(1, parseInt(args[0], 10) || 1)
    const todos = Object.entries(T.JOGOS).map(([k, j]) => ({ chave: k, ...j }))
    const porPagina = 5
    const total = Math.ceil(todos.length / porPagina)
    const fatia = todos.slice((pagina - 1) * porPagina, pagina * porPagina)
    if (!fatia.length) return reply('⚔️ Página vazia. São ' + total + ' páginas.')
    let doc = cab('AS REGRAS QUE GERAM BRIGA', '⚔️')
    doc += linha('Página', pagina + ' de ' + total)
    doc += sep()
    for (const j of fatia) {
        doc += '⚔️ *' + j.nome + '*\n' + j.discussao + '\n📖 `' + prefix + NOME_CMD[j.chave] + '`\n\n'
    }
    if (pagina < total) doc += '➡️ _Próxima:_ `' + prefix + 'regrasdiscutidas ' + (pagina + 1) + '`\n'
    doc += '\n💡 _Quando o catálogo diz "regra de casa", a resposta honesta é combinar antes. Não existe versão oficial._'
    return reply(doc)
    }
}
