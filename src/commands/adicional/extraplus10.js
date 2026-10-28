/**
 * Comando .dividirtimes — TIMES SORTEADOS
 *
 * Divide participantes em times equilibrados.
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
    name: 'dividirtimes',
    aliases: ["formartimes","cmd_dividirtimes","alt_dividirtimes","atalho_dividirtimes","abrev_dividirtimes","call_dividirtimes","func_dividirtimes"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Divide participantes em times equilibrados',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const marcados = (mentionedJid || []).map(j => '@' + String(j).split('@')[0])
    const itens = marcados.length ? marcados : itensDe(args.filter(a => !/^\d+$/.test(a)))
    const qtd = parseInt(args.find(a => /^\d+$/.test(a)), 10) || 2
    if (itens.length < 2) return reply('⚔️ Marque as pessoas ou liste os nomes.\n\n📌 Exemplo: `' + prefix + 'dividirtimes 2 ana, bia, caio, davi`')
    const times = F.dividirTimes(itens, qtd)
    let doc = cab('TIMES SORTEADOS', '⚔️')
    times.forEach((t, i) => {
        doc += '\n🛡️ *Time ' + (i + 1) + '* (' + t.length + ')\n'
        for (const p of t) doc += '┃ ' + p + '\n'
    })
    return reply(doc, mentionedJid || [])
    }
}
