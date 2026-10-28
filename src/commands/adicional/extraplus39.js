/**
 * Comando .contaritens — CONTAR ITENS
 *
 * Conta e mostra repetições numa lista.
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
    name: 'contaritens',
    aliases: ["quantositens","cmd_contaritens","alt_contaritens","atalho_contaritens","abrev_contaritens","call_contaritens","func_contaritens"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Conta e mostra repetições numa lista',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const itens = itensDe(args)
    if (!itens.length) return reply(pedeItens(prefix, 'contaritens'))
    const mapa = new Map()
    for (const i of itens) mapa.set(i.toLowerCase(), (mapa.get(i.toLowerCase()) || 0) + 1)
    let doc = cab('CONTAR ITENS', '🧾')
    doc += linha('Total', String(itens.length))
    doc += linha('Diferentes', String(mapa.size)) + '\n'
    for (const [item, n] of [...mapa].sort((a, b) => b[1] - a[1])) {
        doc += '┃ ' + item + (n > 1 ? ' — ' + n + 'x' : '') + '\n'
    }
    return reply(doc)
    }
}
