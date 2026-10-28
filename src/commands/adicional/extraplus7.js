/**
 * Comando .sortearopcao — SORTEIO
 *
 * Escolhe uma opção entre as que você listar.
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
    name: 'sortearopcao',
    aliases: ["escolheropcao","cmd_sortearopcao","alt_sortearopcao","atalho_sortearopcao","abrev_sortearopcao","call_sortearopcao","func_sortearopcao"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Escolhe uma opção entre as que você listar',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const itens = itensDe(args)
    if (itens.length < 2) return reply(pedeItens(prefix, 'sortearopcao'))
    const escolhido = F.escolher(itens)
    let doc = cab('SORTEIO', '🎲')
    doc += linha('Opções', String(itens.length))
    doc += sep()
    doc += '🎯 *' + escolhido + '*\n'
    doc += '\n_Chance de cada uma: ' + (100 / itens.length).toFixed(1) + '%_'
    return reply(doc)
    }
}
