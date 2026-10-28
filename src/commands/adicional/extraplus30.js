/**
 * Comando .semanadoano — SEMANA DO ANO
 *
 * Diz em que semana do ano uma data cai.
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
    name: 'semanadoano',
    aliases: ["qualsemana","cmd_semanadoano","alt_semanadoano","atalho_semanadoano","abrev_semanadoano","call_semanadoano","func_semanadoano"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Diz em que semana do ano uma data cai',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const d = dataOuHoje(args[0]) || new Date()
    const inicio = new Date(d.getFullYear(), 0, 1)
    const semana = Math.ceil((((d - inicio) / 86400000) + inicio.getDay() + 1) / 7)
    const diaDoAno = Math.floor((d - inicio) / 86400000) + 1
    let doc = cab('SEMANA DO ANO', '🗓️')
    doc += linha('Data', fmt(d))
    doc += linha('Semana', semana + ' de 52')
    doc += linha('Dia do ano', diaDoAno + ' de ' + (d.getFullYear() % 4 === 0 ? 366 : 365))
    doc += linha('Dia da semana', d.toLocaleDateString('pt-BR', { weekday: 'long' }))
    doc += '\n' + barra(diaDoAno / 365) + ' do ano'
    return reply(doc)
    }
}
