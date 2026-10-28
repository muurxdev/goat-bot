/**
 * Comando .intervalodatas — ENTRE DUAS DATAS
 *
 * Calcula o intervalo entre duas datas.
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
    name: 'intervalodatas',
    aliases: ["distanciadatas","cmd_intervalodatas","alt_intervalodatas","atalho_intervalodatas","abrev_intervalodatas","call_intervalodatas","func_intervalodatas"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Calcula o intervalo entre duas datas',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const a = dataOuHoje(args[0]), b = dataOuHoje(args[1]) || new Date()
    if (!a) return reply('📅 📌 Uso: `' + prefix + 'intervalodatas 01/01/2020 09/09/2026`')
    const dif = F.diferencaDeDatas(a < b ? a : b, a < b ? b : a)
    let doc = cab('ENTRE DUAS DATAS', '📅')
    doc += linha('De', fmt(a))
    doc += linha('Até', fmt(b))
    doc += sep()
    doc += linha('Dias', dif.dias.toLocaleString('pt-BR'))
    doc += linha('Semanas', dif.semanas.toLocaleString('pt-BR'))
    doc += linha('Meses', String(dif.meses))
    doc += linha('Anos', String(dif.anos))
    return reply(doc)
    }
}
