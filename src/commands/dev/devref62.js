/**
 * Comando .compararestruturas — COMPARAR ESTRUTURAS
 *
 * Coloca duas estruturas lado a lado.
 */

const R = require('../../services/devReferenceService')

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


module.exports = {
    name: 'compararestruturas',
    aliases: ["versusestrutura","cmd_compararestruturas","alt_compararestruturas","atalho_compararestruturas","abrev_compararestruturas","call_compararestruturas","func_compararestruturas"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Coloca duas estruturas lado a lado',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    if (args.length < 2) {
        return reply('⚖️ 📌 Uso: `' + prefix + 'compararestruturas array hashmap`\n\nDisponíveis: ' + Object.keys(R.ESTRUTURAS).join(', '))
    }
    const c = R.compararEstruturas(String(args[0]).toLowerCase(), String(args[1]).toLowerCase())
    if (!c) return reply('❌ Uma das estruturas não existe. Veja `' + prefix + 'refestruturas`.')
    let doc = cab('COMPARAR ESTRUTURAS', '⚖️')
    doc += linha('A', c.a.nome)
    doc += linha('B', c.b.nome)
    doc += sep()
    for (const l of c.linhas) {
        doc += '┃ ' + l.operacao.padEnd(11) + String(l.a).padEnd(9) + ' vs ' + l.b + '\n'
    }
    return reply(doc)
    }
}
