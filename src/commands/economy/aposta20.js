/**
 * Comando .apostamelhorjogo — MELHOR APOSTA DA CASA
 *
 * O jogo que menos tira do seu bolso.
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
    name: 'apostamelhorjogo',
    aliases: ["melhoraposta","cmd_apostamelhorjogo","alt_apostamelhorjogo","atalho_apostamelhorjogo","abrev_apostamelhorjogo","call_apostamelhorjogo","func_apostamelhorjogo"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'O jogo que menos tira do seu bolso',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const melhor = Object.entries(A.JOGOS)
        .map(([k, j]) => ({ j, ve: A.valorEsperado(j.chance, j.retorno) }))
        .sort((a, b) => b.ve - a.ve)[0]
    let doc = cab('MELHOR APOSTA DA CASA', '🏆')
    doc += linha('Jogo', melhor.j.nome)
    doc += linha('Chance', (melhor.j.chance * 100).toFixed(1) + '%')
    doc += linha('Paga', melhor.j.retorno + 'x')
    doc += linha('Valor esperado', (melhor.ve * 100).toFixed(1) + '%')
    doc += linha('Risco', melhor.j.risco)
    doc += '\n_"Melhor" significa perder mais devagar. Nenhum jogo dá lucro no longo prazo._'
    return reply(doc)
    }
}
