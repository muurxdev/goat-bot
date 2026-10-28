/**
 * Comando .apostapiorjogo — PIOR APOSTA DA CASA
 *
 * O jogo que mais rápido esvazia a carteira.
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
    name: 'apostapiorjogo',
    aliases: ["pioraposta","cmd_apostapiorjogo","alt_apostapiorjogo","atalho_apostapiorjogo","abrev_apostapiorjogo","call_apostapiorjogo","func_apostapiorjogo"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'O jogo que mais rápido esvazia a carteira',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const pior = Object.entries(A.JOGOS)
        .map(([k, j]) => ({ j, ve: A.valorEsperado(j.chance, j.retorno) }))
        .sort((a, b) => a.ve - b.ve)[0]
    let doc = cab('PIOR APOSTA DA CASA', '💀')
    doc += linha('Jogo', pior.j.nome)
    doc += linha('Chance', (pior.j.chance * 100).toFixed(1) + '%')
    doc += linha('Valor esperado', (pior.ve * 100).toFixed(1) + '%')
    doc += linha('Risco', pior.j.risco)
    doc += '\n_Apostando 10.000 aqui, a média devolve ' + A.moeda(10000 * (1 + pior.ve)) + '._'
    return reply(doc)
    }
}
