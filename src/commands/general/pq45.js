/**
 * Comando .buscarporque — BUSCAR EXPLICAÇÃO
 *
 * Procura uma explicação por palavra.
 */

const W = require('../../services/whyService')

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
    name: 'buscarporque',
    aliases: ["porqueisso"],
    category: 'general',
    subcategory: 'Por Que',
    description: 'Procura uma explicação por palavra',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ')
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'buscarporque gelo`')
    const achados = W.procurar(termo)
    if (!achados.length) return reply('🔎 Nada encontrado para `' + termo + '`.\n\n💡 _Ver tudo:_ `' + prefix + 'porquetudo`')
    let doc = cab('BUSCA: ' + termo.toUpperCase(), '🔎')
    doc += linha('Resultados', String(achados.length)) + '\n'
    for (const a of achados.slice(0, 25)) doc += '┃ *' + a.nome + '*\n┃    `' + prefix + 'porque' + a.chave + '`\n'
    if (achados.length > 25) doc += '\n_+' + (achados.length - 25) + ' resultados. Refine a busca._'
    return reply(doc)
    }
}
