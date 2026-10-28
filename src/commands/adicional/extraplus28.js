/**
 * Comando .sortearletra — LETRA SORTEADA
 *
 * Sorteia uma letra do alfabeto.
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
    name: 'sortearletra',
    aliases: ["letraaleatoria","cmd_sortearletra","alt_sortearletra","atalho_sortearletra","abrev_sortearletra","call_sortearletra","func_sortearletra"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Sorteia uma letra do alfabeto',
    examples: [' — sorteia uma letra de A a Z'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const letra = String.fromCharCode(65 + F.inteiroSeguro(26))
    return reply(Fmt.tela({
        emoji: '🔤', titulo: 'Letra sorteada: ' + letra, prefix,
        intro: 'Saiu a letra *' + letra + '*.',
        dica: 'Boa para jogo de stop ou desafio de palavras: todo mundo escreve algo que comece com ela.',
        proximos: [
            { nome: 'sortearletra', oque: 'sorteia outra letra' },
            { nome: 'sortearvalor', args: '1 60', oque: 'sorteia um tempo em segundos' }
        ]
    }))
    }
}
