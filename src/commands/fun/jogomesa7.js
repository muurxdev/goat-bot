/**
 * Comando .jogopoker — PÔQUER (TEXAS HOLD'EM)
 *
 * Regras de Pôquer (Texas Hold'em): como jogar e a regra que sempre gera discussão.
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
    name: 'jogopoker',
    aliases: ["regrasdopoker"],
    category: 'fun',
    subcategory: 'Jogos de Mesa',
    description: 'Regras de Pôquer (Texas Hold\'em): como jogar e a regra que sempre gera discussão',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const j = T.JOGOS['poker']
    const t = T.TIPOS[T.tipoDe(j)]
    let doc = cab("PÔQUER (TEXAS HOLD'EM)", t.emoji)
    doc += linha('Jogadores', j.jogadores)
    doc += linha('Duração', j.duracao)
    doc += linha('Material', j.material)
    doc += sep()
    doc += '🎯 *Objetivo*\n' + j.objetivo + '\n\n'
    doc += '📖 *Como joga*\n' + j.comojoga + '\n\n'
    doc += '⚔️ *A regra que sempre gera briga*\n' + j.discussao + '\n\n'
    doc += '🤝 *Combinem antes de começar*\n' + j.combine + '\n\n'
    doc += t.emoji + ' _Mais jogos de ' + t.nome.toLowerCase() + ':_ `' + prefix + 'jogosdecartas`\n'
    doc += '👥 _O que dá para jogar com o povo que tem aí:_ `' + prefix + 'jogospara 4`'
    return reply(doc)
    }
}
