/**
 * Comando .decisaorapida — DECISÃO
 *
 * Responde sim ou não a uma pergunta.
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
    name: 'decisaorapida',
    aliases: ["responderpergunta","cmd_decisaorapida","alt_decisaorapida","atalho_decisaorapida","abrev_decisaorapida","call_decisaorapida","func_decisaorapida"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Responde sim ou não a uma pergunta',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const pergunta = args.join(' ').trim()
    if (!pergunta) return reply('🤔 📌 Uso: `' + prefix + 'decisaorapida devo estudar hoje?`')
    const respostas = ['Sim, com certeza', 'Sim', 'Provavelmente sim', 'Talvez', 'Provavelmente não', 'Não', 'De jeito nenhum']
    let doc = cab('DECISÃO', '🤔')
    doc += linha('Pergunta', pergunta.slice(0, 60))
    doc += sep()
    doc += '🎯 *' + F.escolher(respostas) + '*\n'
    doc += '\n_Sorteio puro. A decisão continua sendo sua._'
    return reply(doc)
    }
}
