/**
 * Comando .apostaajuda — GUIA DA MESA
 *
 * Todos os comandos de análise de aposta.
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
    name: 'apostaajuda',
    aliases: ["guiaapostas","cmd_apostaajuda","alt_apostaajuda","atalho_apostaajuda","abrev_apostaajuda","call_apostaajuda","func_apostaajuda"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Todos os comandos de análise de aposta',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('GUIA DA MESA', '🗺️')
    doc += bloco('📊 SEU DESEMPENHO', [
        '`' + prefix + 'apostaresumo` · `' + prefix + 'apostasaldo`',
        '`' + prefix + 'apostajogos` · `' + prefix + 'apostataxa`',
        '`' + prefix + 'apostarelatorio`'
    ])
    doc += '\n' + bloco('🧮 MATEMÁTICA', [
        '`' + prefix + 'apostaodds` · `' + prefix + 'apostaexpectativa`',
        '`' + prefix + 'apostakelly` · `' + prefix + 'apostasimular`',
        '`' + prefix + 'apostamartingale`'
    ])
    doc += '\n' + bloco('🛑 CONTROLE', [
        '`' + prefix + 'apostalimite` · `' + prefix + 'apostastop`',
        '`' + prefix + 'apostaparar` · `' + prefix + 'apostaresponsavel`'
    ])
    return reply(doc)
    }
}
