/**
 * Comando .tempodesde — TEMPO DESDE
 *
 * Quanto tempo passou desde uma data.
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
    name: 'tempodesde',
    aliases: ["contagemdesde","cmd_tempodesde","alt_tempodesde","atalho_tempodesde","abrev_tempodesde","call_tempodesde","func_tempodesde"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Quanto tempo passou desde uma data',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const d = dataOuHoje(args[0])
    if (!d) return reply('⌛ 📌 Uso: `' + prefix + 'tempodesde 01/01/2020`')
    const hoje = new Date()
    if (d > hoje) return reply('⌛ Essa data ainda não chegou. Use `' + prefix + 'tempoate`.')
    const dif = F.diferencaDeDatas(d, hoje)
    let doc = cab('TEMPO DESDE', '⌛')
    doc += linha('Data', fmt(d))
    doc += linha('Passaram', dif.dias.toLocaleString('pt-BR') + ' dias')
    doc += linha('Ou', dif.semanas.toLocaleString('pt-BR') + ' semanas')
    doc += linha('Ou', dif.meses + ' meses')
    doc += linha('Ou', dif.anos + ' anos')
    return reply(doc)
    }
}
