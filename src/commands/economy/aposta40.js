/**
 * Comando .apostaglossario — GLOSSÁRIO DA MESA
 *
 * O que cada termo de aposta significa.
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
    name: 'apostaglossario',
    aliases: ["termosaposta","cmd_apostaglossario","alt_apostaglossario","atalho_apostaglossario","abrev_apostaglossario","call_apostaglossario","func_apostaglossario"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'O que cada termo de aposta significa',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('GLOSSÁRIO DA MESA', '📚')
    const termos = [
        ['Banca', 'o dinheiro que você tem para apostar'],
        ['Valor esperado', 'quanto cada moeda apostada devolve na média'],
        ['Vantagem da casa', 'a fatia que o jogo retém sempre'],
        ['Variação', 'o quanto os resultados oscilam'],
        ['Critério de Kelly', 'fração da banca que a matemática recomenda'],
        ['Limite de perda', 'quanto você aceita perder antes de parar'],
        ['Perseguir perda', 'apostar mais para recuperar — o erro mais caro']
    ]
    for (const [t, d] of termos) doc += '┃ *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
