/**
 * Comando .proporcaosimples — REGRA DE TRÊS
 *
 * Resolve uma proporção simples.
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
    name: 'proporcaosimples',
    aliases: ["calcularproporcao","cmd_proporcaosimples","alt_proporcaosimples","atalho_proporcaosimples","abrev_proporcaosimples","call_proporcaosimples","func_proporcaosimples"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Resolve uma proporção simples',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const [a, b, c] = args.map(x => parseFloat(String(x).replace(',', '.')))
    if ([a, b, c].some(isNaN)) return reply('🧮 📌 Uso: `' + prefix + 'proporcaosimples 2 10 5`\n\n_Se 2 vale 10, quanto vale 5?_')
    if (!a) return reply('🧮 O primeiro valor não pode ser zero.')
    const x = (b * c) / a
    let doc = cab('REGRA DE TRÊS', '🧮')
    doc += '┃ ' + a + ' ─── ' + b + '\n'
    doc += '┃ ' + c + ' ─── *' + x.toLocaleString('pt-BR') + '*\n'
    doc += sep()
    doc += linha('Resultado', x.toLocaleString('pt-BR'))
    return reply(doc)
    }
}
