/**
 * Comando .sortearvalor — NÚMERO SORTEADO
 *
 * Sorteia um número dentro de um intervalo.
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
    name: 'sortearvalor',
    aliases: ["valoraleatorio","cmd_sortearvalor","alt_sortearvalor","atalho_sortearvalor","abrev_sortearvalor","call_sortearvalor","func_sortearvalor"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Sorteia um número dentro de um intervalo',
    usage: '[mínimo] [máximo]',
    examples: [' — de 1 a 100', '50 — de 1 a 50', '10 20 — de 10 a 20'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const a = parseInt(args[0], 10)
    const b = parseInt(args[1], 10)
    // Só um número: de 1 até ele. Antes ".sortearvalor 50" caía em min = max e mostrava o uso.
    const min = isNaN(a) ? 1 : (isNaN(b) ? Math.min(1, a) : Math.min(a, b))
    const max = isNaN(a) ? 100 : (isNaN(b) ? Math.max(1, a) : Math.max(a, b))
    if (max <= min) return reply(Fmt.tela({
        emoji: '🎰', titulo: 'Intervalo inválido', prefix,
        intro: 'Preciso de dois números diferentes: o menor e o maior do sorteio.',
        secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [Fmt.cmd(prefix, 'sortearvalor', '<mínimo> <máximo>')] }],
        proximos: [{ nome: 'sortearvalor', args: '1 100', oque: 'de 1 a 100' }]
    }))
    const n = min + F.inteiroSeguro(max - min + 1)
    return reply(Fmt.tela({
        emoji: '🎰', titulo: 'Número sorteado: ' + n, prefix,
        intro: 'Saiu o *' + n + '*, entre ' + min + ' e ' + max + '.',
        dica: isNaN(a) ? 'Sem números, sorteio de 1 a 100. Informe o mínimo e o máximo para outro intervalo.' : '',
        proximos: [
            { nome: 'sortearvalor', args: '1 10', oque: 'sorteia de 1 a 10' },
            { nome: 'rolagemdados', args: '1d20', oque: 'rola um dado de 20 faces' }
        ]
    }))
    }
}
