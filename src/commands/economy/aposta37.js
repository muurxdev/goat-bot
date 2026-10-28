/**
 * Comando .apostarelatorio — RELATÓRIO COMPLETO
 *
 * Tudo sobre suas apostas em uma tela.
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
    name: 'apostarelatorio',
    aliases: ["relatorioapostas","cmd_apostarelatorio","alt_apostarelatorio","atalho_apostarelatorio","abrev_apostarelatorio","call_apostarelatorio","func_apostarelatorio"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Tudo sobre suas apostas em uma tela',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const geral = A.desempenho(sender)
    const mes = A.desempenho(sender, 30)
    const s = A.sequencias(sender)
    const jogos = A.porJogo(sender)
    let doc = cab('RELATÓRIO COMPLETO', '🧾')
    if (!geral.rodadas) return reply(doc + semDados(prefix))
    doc += linha('Rodadas totais', String(geral.rodadas))
    doc += linha('Resultado geral', (geral.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(geral.saldo))
    doc += linha('Últimos 30 dias', (mes.saldo >= 0 ? '+' : '') + A.moeda(mes.saldo))
    doc += linha('Taxa de acerto', geral.taxaAcerto.toFixed(1) + '%')
    doc += linha('Maior sequência boa', String(s.maiorVitorias))
    doc += linha('Maior sequência ruim', String(s.maiorDerrotas))
    if (jogos.length) doc += linha('Jogo mais usado', A.JOGOS[jogos[0].jogo]?.nome || jogos[0].jogo)
    return reply(doc)
    }
}
