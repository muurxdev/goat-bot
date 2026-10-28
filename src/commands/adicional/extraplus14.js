/**
 * Comando .criarpaleta — PALETA DE CORES
 *
 * Cria uma paleta harmônica de cores.
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
    name: 'criarpaleta',
    aliases: ["paletaharmonica","cmd_criarpaleta","alt_criarpaleta","atalho_criarpaleta","abrev_criarpaleta","call_criarpaleta","func_criarpaleta"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Cria uma paleta harmônica de cores',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const base = String(args[0] || '').match(/^#?[0-9a-f]{6}$/i) ? args[0] : null
    const paleta = F.gerarPaleta(base, 5)
    let doc = cab('PALETA DE CORES', '🖌️')
    if (base) doc += linha('Base', String(base).toUpperCase()) + '\n'
    paleta.forEach((c, i) => { doc += '┃ ' + (i + 1) + '. ' + c.hex + ' · ' + c.rgb + '\n' })
    doc += '\n📌 Com uma base: `' + prefix + 'criarpaleta #3366CC`'
    return reply(doc)
    }
}
