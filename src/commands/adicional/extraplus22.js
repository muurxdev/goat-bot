/**
 * Comando .converterromano — NÚMERO ROMANO
 *
 * Converte número para algarismo romano.
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
    name: 'converterromano',
    aliases: ["virarromano","cmd_converterromano","alt_converterromano","atalho_converterromano","abrev_converterromano","call_converterromano","func_converterromano"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Converte número para algarismo romano',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const n = parseInt(String(args[0] || '').replace(/\D/g, ''), 10)
    if (!n) return reply('🏛️ 📌 Uso: `' + prefix + 'converterromano 2026`')
    const r = F.paraRomano(n)
    if (!r) return reply('🏛️ Os algarismos romanos vão de 1 a 3999.')
    let doc = cab('NÚMERO ROMANO', '🏛️')
    doc += linha('Número', n.toLocaleString('pt-BR'))
    doc += linha('Romano', r)
    return reply(doc)
    }
}
