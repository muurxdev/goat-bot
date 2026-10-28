/**
 * Comando .deromano — ROMANO PARA NÚMERO
 *
 * Converte algarismo romano para número.
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
    name: 'deromano',
    aliases: ["romanoparanumero","cmd_deromano","alt_deromano","atalho_deromano","abrev_deromano","call_deromano","func_deromano"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Converte algarismo romano para número',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const t = String(args[0] || '').toUpperCase()
    if (!t) return reply('🔢 📌 Uso: `' + prefix + 'deromano MMXXVI`')
    const n = F.deRomano(t)
    if (n === null) return reply('🔢 "' + t + '" não é um algarismo romano válido.')
    let doc = cab('ROMANO PARA NÚMERO', '🔢')
    doc += linha('Romano', t)
    doc += linha('Número', n.toLocaleString('pt-BR'))
    return reply(doc)
    }
}
