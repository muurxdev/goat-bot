/**
 * Comando .calendario — CALENDÁRIO DO MÊS
 *
 * Mostra o calendário de um mês.
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
    name: 'calendario',
    aliases: ["calendariomes","cmd_calendario","alt_calendario","atalho_calendario","abrev_calendario","call_calendario","func_calendario"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Mostra o calendário de um mês',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const hoje = new Date()
    const mes = Math.min(12, Math.max(1, parseInt(args[0], 10) || (hoje.getMonth() + 1)))
    const ano = parseInt(args[1], 10) || hoje.getFullYear()
    const primeiro = new Date(ano, mes - 1, 1)
    const dias = new Date(ano, mes, 0).getDate()
    let doc = cab(primeiro.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase() + ' ' + ano, '📅')
    doc += '` D  S  T  Q  Q  S  S\n'
    let linhaAtual = '  '.repeat(0) + ' '.repeat(primeiro.getDay() * 3)
    for (let d = 1; d <= dias; d++) {
        linhaAtual += String(d).padStart(2) + ' '
        if ((primeiro.getDay() + d) % 7 === 0) { doc += linhaAtual + '\n'; linhaAtual = '' }
    }
    if (linhaAtual.trim()) doc += linhaAtual + '\n'
    doc += '`'
    return reply(doc)
    }
}
