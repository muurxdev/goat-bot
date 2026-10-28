/**
 * Comando .gerarslug — ENDEREÇO AMIGÁVEL
 *
 * Transforma um texto em identificador de endereço.
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
    name: 'gerarslug',
    aliases: ["textoparaurl","cmd_gerarslug","alt_gerarslug","atalho_gerarslug","abrev_gerarslug","call_gerarslug","func_gerarslug"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Transforma um texto em identificador de endereço',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const texto = args.join(' ').trim()
    if (!texto) return reply('🔗 📌 Uso: `' + prefix + 'gerarslug Ação e Reação: o Guia`')
    let doc = cab('ENDEREÇO AMIGÁVEL', '🔗')
    doc += linha('Original', texto.slice(0, 50))
    doc += linha('Resultado', F.paraSlug(texto))
    return reply(doc)
    }
}
