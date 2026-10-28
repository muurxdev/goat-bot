/**
 * Comando .apostaodds — TABELA DE PROBABILIDADES
 *
 * Chance real e retorno de cada jogo da casa.
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
    name: 'apostaodds',
    aliases: ["probabilidades","cmd_apostaodds","alt_apostaodds","atalho_apostaodds","abrev_apostaodds","call_apostaodds","func_apostaodds"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Chance real e retorno de cada jogo da casa',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('TABELA DE PROBABILIDADES', '📊')
    for (const [chave, j] of Object.entries(A.JOGOS)) {
        const ve = A.valorEsperado(j.chance, j.retorno) * 100
        doc += '┃ ' + j.nome.padEnd(16) + (j.chance * 100).toFixed(1) + '% · ' + j.retorno + 'x · ' + ve.toFixed(1) + '%\n'
    }
    doc += '\n_Colunas: chance de ganhar · quanto paga · valor esperado._'
    doc += '\n💡 _Valor esperado negativo em todos: é assim que a casa lucra._'
    return reply(doc)
    }
}
