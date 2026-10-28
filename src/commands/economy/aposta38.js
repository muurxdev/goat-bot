/**
 * Comando .apostaresponsavel — JOGO RESPONSÁVEL
 *
 * O que todo apostador precisa saber.
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
    name: 'apostaresponsavel',
    aliases: ["jogoresponsavel","cmd_apostaresponsavel","alt_apostaresponsavel","atalho_apostaresponsavel","abrev_apostaresponsavel","call_apostaresponsavel","func_apostaresponsavel"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'O que todo apostador precisa saber',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('JOGO RESPONSÁVEL', '🧭')
    doc += '🎲 *A casa sempre ganha.* Todos os jogos têm valor esperado negativo. Quanto mais você joga, mais perto do prejuízo o resultado chega.\n\n'
    doc += '🔁 *Sequência não existe.* Cada rodada é independente. Dez derrotas seguidas não deixam a próxima mais provável.\n\n'
    doc += '💸 *Não persiga perda.* Dobrar para recuperar é o caminho mais rápido para zerar a banca. Veja `' + prefix + 'apostamartingale`.\n\n'
    doc += '🛑 *Defina limites antes.* Use `' + prefix + 'apostalimite`, `' + prefix + 'apostastop` e `' + prefix + 'apostaparar`.\n\n'
    doc += '🧭 *Aposte por diversão*, com o que sobra — nunca com o que faz falta.'
    return reply(doc)
    }
}
