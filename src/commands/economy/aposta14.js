/**
 * Comando .apostacalcular — CALCULAR RETORNO
 *
 * Quanto você recebe se ganhar uma aposta.
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
    name: 'apostacalcular',
    aliases: ["calcularaposta","cmd_apostacalcular","alt_apostacalcular","atalho_apostacalcular","abrev_apostacalcular","call_apostacalcular","func_apostacalcular"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Quanto você recebe se ganhar uma aposta',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const j = jogoDe(args)
    const valor = parseInt(String(args[1] || '').replace(/\D/g, ''), 10)
    if (!j || !valor) return reply('🧮 📌 Uso: `' + prefix + 'apostacalcular roleta 5000`\n\nJogos: ' + Object.keys(A.JOGOS).join(', '))
    let doc = cab('CALCULAR RETORNO', '🧮')
    doc += linha('Jogo', j.nome)
    doc += linha('Aposta', A.moeda(valor))
    doc += linha('Chance de ganhar', (j.chance * 100).toFixed(1) + '%')
    doc += sep()
    doc += linha('Se ganhar', A.moeda(valor * j.retorno) + ' (lucro ' + A.moeda(valor * j.retorno - valor) + ')')
    doc += linha('Se perder', '-' + A.moeda(valor))
    doc += linha('Valor esperado', A.moeda(valor * A.valorEsperado(j.chance, j.retorno)))
    return reply(doc)
    }
}
