/**
 * Comando .tabuadacompleta — TABUADA
 *
 * Mostra a tabuada de um número.
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
    name: 'tabuadacompleta',
    aliases: ["vertabuada","cmd_tabuadacompleta","alt_tabuadacompleta","atalho_tabuadacompleta","abrev_tabuadacompleta","call_tabuadacompleta","func_tabuadacompleta"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Mostra a tabuada de um número',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const n = parseInt(args[0], 10)
    if (isNaN(n)) return reply('✖️ 📌 Uso: `' + prefix + 'tabuadacompleta 7`')
    const ate = Math.min(20, Math.max(10, parseInt(args[1], 10) || 10))
    let doc = cab('TABUADA DO ' + n, '✖️')
    for (let i = 1; i <= ate; i++) doc += '┃ ' + n + ' × ' + String(i).padStart(2) + ' = ' + (n * i) + '\n'
    return reply(doc)
    }
}
