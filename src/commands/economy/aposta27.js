/**
 * Comando .apostaparar — PAUSAR APOSTAS
 *
 * Bloqueia você mesmo de apostar por um período.
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
    name: 'apostaparar',
    aliases: ["pausaapostas","cmd_apostaparar","alt_apostaparar","atalho_apostaparar","abrev_apostaparar","call_apostaparar","func_apostaparar"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Bloqueia você mesmo de apostar por um período',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const horas = Math.min(720, Math.max(1, parseInt(args[0], 10) || 24))
    const ate = Date.now() + horas * 3600000
    A.salvarLimite(user, 'apostaPausaAte', ate)
    let doc = cab('PAUSAR APOSTAS', '🛑')
    doc += linha('Pausa de', horas + ' horas')
    doc += linha('Libera em', new Date(ate).toLocaleString('pt-BR'))
    doc += '\n_Pedir para ser impedido é a decisão mais inteligente que se pode tomar numa mesa de apostas._'
    return reply(doc)
    }
}
