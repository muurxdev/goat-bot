/**
 * Comando .ordenaralfabetica — ORDEM ALFABÉTICA
 *
 * Coloca uma lista em ordem alfabética.
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
    name: 'ordenaralfabetica',
    aliases: ["ordenarlista","cmd_ordenaralfabetica","alt_ordenaralfabetica","atalho_ordenaralfabetica","abrev_ordenaralfabetica","call_ordenaralfabetica","func_ordenaralfabetica"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Coloca uma lista em ordem alfabética',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const itens = itensDe(args)
    if (!itens.length) return reply(pedeItens(prefix, 'ordenaralfabetica'))
    const ordenados = [...itens].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    let doc = cab('ORDEM ALFABÉTICA', '🔤')
    ordenados.forEach((x, i) => { doc += '┃ ' + (i + 1) + '. ' + x + '\n' })
    return reply(doc)
    }
}
