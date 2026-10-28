/**
 * Comando .moedaviciada — CARA OU COROA
 *
 * Joga uma moeda com resultado justo.
 */

const F = require('../../services/toolsService')
const Fmt = require('../../utils/formato')

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

function itensDe(args) {
    return (args || []).join(' ').split(/[;,\n]| \| /).map(s => s.trim()).filter(Boolean)
}
function pedeItens(prefix, cmd) {
    return '📋 *Informe as opções separadas por vírgula.*\n\n📌 Exemplo: `' + prefix + cmd + ' pizza, hambúrguer, sushi`'
}
function dataOuHoje(txt) {
    const d = F.lerData(txt)
    return d && !isNaN(d.getTime()) ? d : null
}
function fmt(d) { return d.toLocaleDateString('pt-BR') }

module.exports = {
    name: 'moedaviciada',
    aliases: ["caracoroaextra","cmd_moedaviciada","alt_moedaviciada","atalho_moedaviciada","abrev_moedaviciada","call_moedaviciada","func_moedaviciada"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Joga uma moeda com resultado justo',
    examples: [' — joga a moeda'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const resultado = F.inteiroSeguro(2) === 0 ? 'CARA' : 'COROA'
    return reply(Fmt.tela({
        emoji: '🪙', titulo: 'Deu ' + (resultado === 'CARA' ? 'cara' : 'coroa') + '!', prefix,
        intro: 'Joguei a moeda e caiu *' + (resultado === 'CARA' ? 'Cara' : 'Coroa') + '*.',
        dica: 'Sorteio justo de verdade: 50% de chance para cada lado, sem vício.',
        proximos: [
            { nome: 'moedaviciada', oque: 'joga de novo' },
            { nome: 'rolagemdados', args: '1d6', oque: 'rola um dado' }
        ]
    }))
    }
}
