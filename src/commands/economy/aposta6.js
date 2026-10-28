/**
 * Comando .apostataxa — TAXA DE ACERTO
 *
 * Percentual de rodadas em que você venceu.
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
    name: 'apostataxa',
    aliases: ["taxaacerto","cmd_apostataxa","alt_apostataxa","atalho_apostataxa","abrev_apostataxa","call_apostataxa","func_apostataxa"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Percentual de rodadas em que você venceu',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const d = A.desempenho(sender)
    let doc = cab('TAXA DE ACERTO', '🎯')
    if (!d.rodadas) return reply(doc + semDados(prefix))
    doc += linha('Rodadas', String(d.rodadas))
    doc += linha('Vitórias', String(d.vitorias))
    doc += linha('Taxa', d.taxaAcerto.toFixed(1) + '%')
    doc += '\n' + barra(d.taxaAcerto / 100)
    return reply(doc)
    }
}
