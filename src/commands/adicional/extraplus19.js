/**
 * Comando .diasuteis — DIAS ÚTEIS
 *
 * Conta os dias úteis entre duas datas.
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
    name: 'diasuteis',
    aliases: ["contardiasuteis","cmd_diasuteis","alt_diasuteis","atalho_diasuteis","abrev_diasuteis","call_diasuteis","func_diasuteis"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Conta os dias úteis entre duas datas',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const a = dataOuHoje(args[0]), b = dataOuHoje(args[1])
    if (!a || !b) return reply('💼 📌 Uso: `' + prefix + 'diasuteis 01/09/2026 30/09/2026`')
    const inicio = a < b ? a : b, fim = a < b ? b : a
    const uteis = F.diasUteis(inicio, fim)
    const total = F.diferencaDeDatas(inicio, fim).dias + 1
    let doc = cab('DIAS ÚTEIS', '💼')
    doc += linha('Período', fmt(inicio) + ' a ' + fmt(fim))
    doc += linha('Dias corridos', String(total))
    doc += linha('Dias úteis', String(uteis))
    doc += linha('Fins de semana', String(total - uteis))
    doc += '\n_Não considera feriados. Veja `' + prefix + 'listaferiados`._'
    return reply(doc)
    }
}
