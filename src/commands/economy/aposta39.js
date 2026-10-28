/**
 * Comando .apostaregras — COMO A MESA FUNCIONA
 *
 * As regras das apostas no Reino.
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
    name: 'apostaregras',
    aliases: ["comofuncionaaposta","cmd_apostaregras","alt_apostaregras","atalho_apostaregras","abrev_apostaregras","call_apostaregras","func_apostaregras"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'As regras das apostas no Reino',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    let doc = cab('COMO A MESA FUNCIONA', '📖')
    doc += '🎯 *Chance* — probabilidade de a rodada dar a seu favor.\n\n'
    doc += '💰 *Retorno* — quanto a casa paga sobre o valor apostado.\n\n'
    doc += '📉 *Valor esperado* — chance × retorno − 1. Negativo em todos os jogos: é a vantagem da casa.\n\n'
    doc += '🌊 *Variação* — o quanto o resultado balança. Alta variação dá prêmios maiores e ruínas mais rápidas.\n\n'
    doc += '📊 Veja os números reais em `' + prefix + 'apostaodds`.'
    return reply(doc)
    }
}
