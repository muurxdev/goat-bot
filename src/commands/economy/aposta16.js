/**
 * Comando .apostakelly — QUANTO APOSTAR
 *
 * A fração da banca que a matemática recomenda.
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
    name: 'apostakelly',
    aliases: ["criteriokelly","cmd_apostakelly","alt_apostakelly","atalho_apostakelly","abrev_apostakelly","call_apostakelly","func_apostakelly"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'A fração da banca que a matemática recomenda',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const j = jogoDe(args)
    if (!j) return reply(listaDeJogos(prefix, 'apostakelly'))
    const f = A.kelly(j.chance, j.retorno)
    const banca = (Number(user.coins) || 0) + (Number(user.bank) || 0)
    let doc = cab('QUANTO APOSTAR', '📐')
    doc += linha('Jogo', j.nome)
    doc += linha('Sua banca', A.moeda(banca))
    doc += linha('Fração recomendada', (f * 100).toFixed(1) + '%')
    doc += linha('Valor recomendado', A.moeda(banca * f))
    doc += '\n_' + (f === 0
        ? 'Zero. O critério de Kelly recomenda não apostar quando o valor esperado é negativo — e é o caso de todo jogo da casa.'
        : 'Fração que maximiza o crescimento da banca no longo prazo.') + '_'
    return reply(doc)
    }
}
