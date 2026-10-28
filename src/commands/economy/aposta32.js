/**
 * Comando .apostalimites — SEUS LIMITES
 *
 * Todos os limites que você configurou.
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
    name: 'apostalimites',
    aliases: ["meuslimites","cmd_apostalimites","alt_apostalimites","atalho_apostalimites","abrev_apostalimites","call_apostalimites","func_apostalimites"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Todos os limites que você configurou',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const l = A.limites(user)
    const p = A.emPausa(user)
    let doc = cab('SEUS LIMITES', '📋')
    doc += linha('Por aposta', l.porAposta ? A.moeda(l.porAposta) : 'sem limite')
    doc += linha('Por dia', l.diario ? A.moeda(l.diario) : 'sem limite')
    doc += linha('Meta de ganho', l.meta ? A.moeda(l.meta) : 'não definida')
    doc += linha('Limite de perda', l.stopPerda ? A.moeda(l.stopPerda) : 'não definido')
    doc += linha('Pausa', p.pausado ? '🔒 ' + A.duracao(p.restanteMs) + ' restantes' : '🟢 liberado')
    return reply(doc)
    }
}
