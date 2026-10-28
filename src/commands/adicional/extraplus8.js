/**
 * Comando .sortearordem — ORDEM SORTEADA
 *
 * Embaralha a ordem de uma lista.
 */

const F = require('../../services/toolsService')

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
    name: 'sortearordem',
    aliases: ["embaralharlista","cmd_sortearordem","alt_sortearordem","atalho_sortearordem","abrev_sortearordem","call_sortearordem","func_sortearordem"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Embaralha a ordem de uma lista',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const itens = itensDe(args)
    if (itens.length < 2) return reply(pedeItens(prefix, 'sortearordem'))
    const ordem = F.embaralhar(itens)
    let doc = cab('ORDEM SORTEADA', '🔀')
    ordem.forEach((x, i) => { doc += '┃ ' + (i + 1) + '. ' + x + '\n' })
    return reply(doc)
    }
}
