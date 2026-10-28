/**
 * Comando .apostacusto — O CUSTO DE APOSTAR
 *
 * Quanto suas apostas custariam guardadas no banco.
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
    name: 'apostacusto',
    aliases: ["custodeapostar","cmd_apostacusto","alt_apostacusto","atalho_apostacusto","abrev_apostacusto","call_apostacusto","func_apostacusto"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Quanto suas apostas custariam guardadas no banco',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const d = A.desempenho(sender)
    let doc = cab('O CUSTO DE APOSTAR', '⏳')
    if (!d.rodadas) return reply(doc + semDados(prefix))
    const perdido = Math.max(0, -d.saldo)
    if (!perdido) return reply(doc + '🟢 _Você está no lucro. Nada a lamentar por enquanto._')
    doc += linha('Perdido nas mesas', A.moeda(perdido))
    doc += sep()
    for (const dias of [30, 180, 365]) {
        const rendido = perdido * Math.pow(1.005, dias)
        doc += '┃ Guardado ' + String(dias + 'd').padEnd(6) + A.moeda(rendido) + '\n'
    }
    doc += '\n_É quanto o mesmo dinheiro renderia no banco em vez de na mesa._'
    return reply(doc)
    }
}
