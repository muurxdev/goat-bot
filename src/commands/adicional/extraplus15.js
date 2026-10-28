/**
 * Comando .analisarcor — DETALHES DA COR
 *
 * Mostra RGB e contraste de uma cor.
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
    name: 'analisarcor',
    aliases: ["detalharcor","cmd_analisarcor","alt_analisarcor","atalho_analisarcor","abrev_analisarcor","call_analisarcor","func_analisarcor"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Mostra RGB e contraste de uma cor',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const hex = String(args[0] || '').replace('#', '')
    if (!/^[0-9a-f]{6}$/i.test(hex)) return reply('🔍 📌 Uso: `' + prefix + 'analisarcor #3366CC`')
    const c = F.detalharCor(hex)
    let doc = cab('DETALHES DA COR', '🔍')
    doc += linha('Hexadecimal', '#' + hex.toUpperCase())
    doc += linha('RGB', c.rgb)
    doc += linha('Vermelho', String(c.r))
    doc += linha('Verde', String(c.g))
    doc += linha('Azul', String(c.b))
    doc += linha('Luminância', (c.luminancia * 100).toFixed(0) + '%')
    doc += linha('Melhor texto', c.clara ? '⚫ preto' : '⚪ branco')
    return reply(doc)
    }
}
