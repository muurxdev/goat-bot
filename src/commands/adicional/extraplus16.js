/**
 * Comando .calcularanos — IDADE
 *
 * Calcula a idade a partir da data de nascimento.
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
    name: 'calcularanos',
    aliases: ["minhaidade","cmd_calcularanos","alt_calcularanos","atalho_calcularanos","abrev_calcularanos","call_calcularanos","func_calcularanos"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Calcula a idade a partir da data de nascimento',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const d = dataOuHoje(args[0])
    if (!d) return reply('🎂 📌 Uso: `' + prefix + 'calcularanos 15/03/1998`')
    const hoje = new Date()
    if (d > hoje) return reply('🎂 Essa data ainda não chegou.')
    const dif = F.diferencaDeDatas(d, hoje)
    let doc = cab('IDADE', '🎂')
    doc += linha('Nascimento', fmt(d))
    doc += linha('Idade', dif.anos + ' anos')
    doc += linha('Em meses', dif.meses.toLocaleString('pt-BR'))
    doc += linha('Em dias', dif.dias.toLocaleString('pt-BR'))
    doc += linha('Em horas', dif.horas.toLocaleString('pt-BR'))
    return reply(doc)
    }
}
