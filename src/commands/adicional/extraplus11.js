/**
 * Comando .duplassorteadas — DUPLAS SORTEADAS
 *
 * Forma duplas aleatórias entre os participantes.
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
    name: 'duplassorteadas',
    aliases: ["formarduplas","cmd_duplassorteadas","alt_duplassorteadas","atalho_duplassorteadas","abrev_duplassorteadas","call_duplassorteadas","func_duplassorteadas"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Forma duplas aleatórias entre os participantes',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const marcados = (mentionedJid || []).map(j => '@' + String(j).split('@')[0])
    const itens = marcados.length ? marcados : itensDe(args)
    if (itens.length < 2) return reply('👯 Marque as pessoas ou liste os nomes separados por vírgula.')
    const baralho = F.embaralhar(itens)
    let doc = cab('DUPLAS SORTEADAS', '👯')
    for (let i = 0; i < baralho.length; i += 2) {
        if (baralho[i + 1]) doc += '┃ ' + baralho[i] + ' + ' + baralho[i + 1] + '\n'
        else doc += '┃ ' + baralho[i] + ' _(sobrou)_\n'
    }
    return reply(doc, mentionedJid || [])
    }
}
