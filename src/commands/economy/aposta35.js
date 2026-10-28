/**
 * Comando .apostasorte — ÍNDICE DE SORTE
 *
 * Compara seu resultado com o esperado pela matemática.
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
    name: 'apostasorte',
    aliases: ["indicesorte","cmd_apostasorte","alt_apostasorte","atalho_apostasorte","abrev_apostasorte","call_apostasorte","func_apostasorte"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Compara seu resultado com o esperado pela matemática',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const d = A.desempenho(sender)
    let doc = cab('ÍNDICE DE SORTE', '🍀')
    if (!d.rodadas) return reply(doc + semDados(prefix))
    const esperado = d.apostado * 0.95
    const indice = esperado ? (d.recebido / esperado) * 100 : 0
    doc += linha('Rodadas', String(d.rodadas))
    doc += linha('Retorno esperado', A.moeda(esperado))
    doc += linha('Retorno real', A.moeda(d.recebido))
    doc += linha('Índice', indice.toFixed(0) + '%')
    doc += '\n_' + (indice > 110 ? '🍀 Acima do esperado — aproveite, não vai durar.' : indice > 90 ? '⚖️ Dentro do esperado.' : '💀 Abaixo do esperado.') + '_'
    return reply(doc)
    }
}
