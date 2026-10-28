/**
 * Comando .apostaresumo — SUA MESA
 *
 * Panorama de tudo que você já apostou.
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
    name: 'apostaresumo',
    aliases: ["resumoapostas","cmd_apostaresumo","alt_apostaresumo","atalho_apostaresumo","abrev_apostaresumo","call_apostaresumo","func_apostaresumo"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Panorama de tudo que você já apostou',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const d = A.desempenho(sender)
    let doc = cab('SUA MESA', '🎰')
    if (!d.rodadas) return reply(doc + semDados(prefix))
    doc += linha('Rodadas', String(d.rodadas))
    doc += linha('Vitórias', d.vitorias + ' (' + d.taxaAcerto.toFixed(1) + '%)')
    doc += linha('Apostado', A.moeda(d.apostado))
    doc += linha('Recebido', A.moeda(d.recebido))
    doc += sep()
    doc += linha('Resultado', (d.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(d.saldo))
    doc += linha('Retorno', d.retornoMedio.toFixed(1) + '% do que apostou')
    return reply(doc)
    }
}
