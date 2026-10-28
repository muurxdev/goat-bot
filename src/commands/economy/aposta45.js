/**
 * Comando .apostaquebrar — RISCO DE QUEBRAR
 *
 * Chance de zerar a banca no jogo escolhido.
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
    name: 'apostaquebrar',
    aliases: ["riscoquebrar","cmd_apostaquebrar","alt_apostaquebrar","atalho_apostaquebrar","abrev_apostaquebrar","call_apostaquebrar","func_apostaquebrar"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Chance de zerar a banca no jogo escolhido',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const j = jogoDe(args)
    const valor = parseInt(String(args[1] || '').replace(/\D/g, ''), 10) || 1000
    if (!j) return reply('💣 📌 Uso: `' + prefix + 'apostaquebrar roleta 1000`')
    const banca = (Number(user.coins) || 0) + (Number(user.bank) || 0)
    if (!banca) return reply('💣 _Sem banca para arriscar._')
    // Cinco simulações de 200 rodadas dão uma leitura rápida do risco.
    let quebras = 0
    for (let i = 0; i < 5; i++) if (A.simular(j.chance, j.retorno, valor, 200, banca).quebrou) quebras++
    let doc = cab('RISCO DE QUEBRAR', '💣')
    doc += linha('Jogo', j.nome)
    doc += linha('Banca', A.moeda(banca))
    doc += linha('Aposta por rodada', A.moeda(valor))
    doc += linha('Rodadas possíveis', String(Math.floor(banca / valor)))
    doc += linha('Quebrou em', quebras + ' de 5 simulações de 200 rodadas')
    doc += '\n_' + (quebras >= 4 ? '🔴 Risco altíssimo de zerar.' : quebras >= 2 ? '🟡 Risco considerável.' : '🟢 Risco menor — mas o prejuízo médio continua negativo.') + '_'
    return reply(doc)
    }
}
