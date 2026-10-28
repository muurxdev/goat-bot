/**
 * Comando .itensnumerados — LISTA NUMERADA
 *
 * Numera os itens que você listar.
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
    name: 'itensnumerados',
    aliases: ["numeraritens","cmd_itensnumerados","alt_itensnumerados","atalho_itensnumerados","abrev_itensnumerados","call_itensnumerados","func_itensnumerados"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Numera os itens que você listar',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const itens = itensDe(args)
    if (!itens.length) return reply(pedeItens(prefix, 'itensnumerados'))
    let doc = cab('LISTA NUMERADA', '🔢')
    itens.forEach((x, i) => { doc += '┃ ' + String(i + 1).padStart(2) + '. ' + x + '\n' })
    doc += '\n_' + itens.length + ' itens._'
    return reply(doc)
    }
}
