/**
 * Comando .apostasimular — SIMULAR RODADAS
 *
 * Roda apostas de mentira para ver o resultado provável.
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
    name: 'apostasimular',
    aliases: ["simularapostas","cmd_apostasimular","alt_apostasimular","atalho_apostasimular","abrev_apostasimular","call_apostasimular","func_apostasimular"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Roda apostas de mentira para ver o resultado provável',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const j = jogoDe(args)
    const valor = parseInt(String(args[1] || '').replace(/\D/g, ''), 10) || 1000
    const rodadas = Math.min(1000, Math.max(1, parseInt(args[2], 10) || 100))
    if (!j) return reply('🔬 📌 Uso: `' + prefix + 'apostasimular roleta 1000 100`\n\n(jogo, valor por rodada, número de rodadas)')
    const banca = valor * rodadas
    const r = A.simular(j.chance, j.retorno, valor, rodadas, banca)
    let doc = cab('SIMULAR RODADAS', '🔬')
    doc += linha('Jogo', j.nome)
    doc += linha('Aposta por rodada', A.moeda(valor))
    doc += linha('Rodadas', String(r.rodadasFeitas))
    doc += linha('Banca inicial', A.moeda(banca))
    doc += sep()
    doc += linha('Banca final', A.moeda(r.saldoFinal))
    doc += linha('Resultado', (r.resultado >= 0 ? '🟢 +' : '🔴 ') + A.moeda(r.resultado))
    doc += linha('Vitórias', r.vitorias + ' de ' + r.rodadasFeitas)
    doc += linha('Melhor momento', A.moeda(r.maiorSaldo))
    doc += linha('Pior momento', A.moeda(r.menorSaldo))
    if (r.quebrou) doc += '\n🔴 _A banca acabou antes das ' + rodadas + ' rodadas._'
    doc += '\n\n_Simulação com moedas de mentira. Nada foi debitado._'
    return reply(doc)
    }
}
