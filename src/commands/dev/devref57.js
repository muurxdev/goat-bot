/**
 * Comando .refestruturas — ESTRUTURAS DE DADOS
 *
 * Comparação de custo entre as estruturas.
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
    name: 'refestruturas',
    aliases: ["tabelaestruturas","cmd_refestruturas","alt_refestruturas","atalho_refestruturas","abrev_refestruturas","call_refestruturas","func_refestruturas"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Comparação de custo entre as estruturas',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('ESTRUTURAS DE DADOS', '🧱')
    doc += '` estrutura      acesso  busca   inserção`\n'
    for (const [k, e] of Object.entries(R.ESTRUTURAS)) {
        doc += '┃ ' + k.slice(0, 13).padEnd(14) + String(e.acesso).padEnd(8) + String(e.busca).padEnd(8) + e.insercao + '\n'
    }
    doc += '\n💡 _Detalhe:_ `' + prefix + 'estruturahashmap`'
    return reply(doc)
    }
}
