/**
 * Comando .tempoate — TEMPO ATÉ
 *
 * Quanto falta para uma data.
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
    name: 'tempoate',
    aliases: ["contagemate","cmd_tempoate","alt_tempoate","atalho_tempoate","abrev_tempoate","call_tempoate","func_tempoate"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Quanto falta para uma data',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const d = dataOuHoje(args[0])
    if (!d) return reply('⏳ 📌 Uso: `' + prefix + 'tempoate 25/12/2026`')
    const hoje = new Date()
    if (d <= hoje) return reply('⏳ Essa data já passou. Use `' + prefix + 'tempodesde`.')
    const dif = F.diferencaDeDatas(hoje, d)
    let doc = cab('TEMPO ATÉ', '⏳')
    doc += linha('Data', fmt(d))
    doc += linha('Faltam', dif.dias + ' dias')
    doc += linha('Ou', dif.semanas + ' semanas')
    doc += linha('Ou', dif.horas.toLocaleString('pt-BR') + ' horas')
    if (dif.meses) doc += linha('Ou', dif.meses + ' meses')
    return reply(doc)
    }
}
