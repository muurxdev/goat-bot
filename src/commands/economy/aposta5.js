/**
 * Comando .apostasaldo — RESULTADO LÍQUIDO
 *
 * Se no conjunto você está ganhando ou perdendo.
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
    name: 'apostasaldo',
    aliases: ["saldoapostas","cmd_apostasaldo","alt_apostasaldo","atalho_apostasaldo","abrev_apostasaldo","call_apostasaldo","func_apostasaldo"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Se no conjunto você está ganhando ou perdendo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const d = A.desempenho(sender)
    let doc = cab('RESULTADO LÍQUIDO', '⚖️')
    if (!d.rodadas) return reply(doc + semDados(prefix))
    doc += linha('Entrou', A.moeda(d.recebido))
    doc += linha('Saiu', A.moeda(d.apostado))
    doc += sep()
    doc += linha('Líquido', (d.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(d.saldo))
    doc += '\n_' + (d.saldo >= 0 ? 'Você está no lucro — situação rara e temporária.' : 'Você está no prejuízo. É o resultado esperado: a casa tem vantagem em todos os jogos.') + '_'
    return reply(doc)
    }
}
