/**
 * Comando .apostamartingale — ESTRATÉGIA DE DOBRAR
 *
 * Por que dobrar a aposta após perder não funciona.
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
    name: 'apostamartingale',
    aliases: ["dobraraposta","cmd_apostamartingale","alt_apostamartingale","atalho_apostamartingale","abrev_apostamartingale","call_apostamartingale","func_apostamartingale"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Por que dobrar a aposta após perder não funciona',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const valor = parseInt(String(args[0] || '').replace(/\D/g, ''), 10) || 1000
    let doc = cab('ESTRATÉGIA DE DOBRAR', '♟️')
    doc += '_A ideia: dobrar a aposta a cada derrota para recuperar tudo na primeira vitória._\n\n'
    doc += linha('Aposta inicial', A.moeda(valor)) + '\n'
    let acumulado = 0, atual = valor
    for (let i = 1; i <= 8; i++) {
        acumulado += atual
        doc += '┃ ' + i + 'ª derrota → próxima ' + A.moeda(atual * 2) + ' (perdido: ' + A.moeda(acumulado) + ')\n'
        atual *= 2
    }
    doc += '\n🔴 _Oito derrotas seguidas exigem ' + A.moeda(atual) + ' na mão para continuar. É por isso que a estratégia quebra: a banca acaba antes da sorte virar._'
    return reply(doc)
    }
}
