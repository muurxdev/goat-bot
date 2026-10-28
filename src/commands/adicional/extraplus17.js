/**
 * Comando .proximoaniversario — PRÓXIMO ANIVERSÁRIO
 *
 * Quantos dias faltam para a data.
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
    name: 'proximoaniversario',
    aliases: ["faltamdiasaniversario","cmd_proximoaniversario","alt_proximoaniversario","atalho_proximoaniversario","abrev_proximoaniversario","call_proximoaniversario","func_proximoaniversario"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Quantos dias faltam para a data',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const d = dataOuHoje(args[0])
    if (!d) return reply('🎉 📌 Uso: `' + prefix + 'proximoaniversario 15/03` ou com o ano completo')
    const hoje = new Date()
    const prox = new Date(hoje.getFullYear(), d.getMonth(), d.getDate())
    if (prox < hoje) prox.setFullYear(prox.getFullYear() + 1)
    const dias = Math.ceil((prox - hoje) / 86400000)
    let doc = cab('PRÓXIMO ANIVERSÁRIO', '🎉')
    doc += linha('Data', fmt(prox))
    doc += linha('Faltam', dias + ' dias')
    doc += linha('Dia da semana', prox.toLocaleDateString('pt-BR', { weekday: 'long' }))
    if (dias === 0) doc += '\n🎂 _É hoje!_'
    return reply(doc)
    }
}
