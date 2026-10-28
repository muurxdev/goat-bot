/**
 * Comando .apostasequencia — SEQUÊNCIAS
 *
 * Suas maiores sequências de vitória e derrota.
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
    name: 'apostasequencia',
    aliases: ["sequenciaapostas","cmd_apostasequencia","alt_apostasequencia","atalho_apostasequencia","abrev_apostasequencia","call_apostasequencia","func_apostasequencia"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Suas maiores sequências de vitória e derrota',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const s = A.sequencias(sender)
    let doc = cab('SEQUÊNCIAS', '🔥')
    if (!s.maiorVitorias && !s.maiorDerrotas) return reply(doc + semDados(prefix))
    doc += linha('Maior sequência de vitórias', String(s.maiorVitorias))
    doc += linha('Maior sequência de derrotas', String(s.maiorDerrotas))
    doc += linha('Sequência atual', s.atual + ' ' + s.atualTipo)
    doc += '\n_Sequência não muda a próxima rodada: cada aposta é independente da anterior._'
    return reply(doc)
    }
}
