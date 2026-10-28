/**
 * Comando .buscarcarro — BUSCA DO CARRO
 *
 * Procura luz, peça, infração ou emergência.
 */

const A = require('../../services/autoService')

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
    name: 'buscarcarro',
    aliases: ["acharnocarro"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Procura luz, peça, infração ou emergência',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ')
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'buscarcarro freio`')
    const achados = A.procurar(termo)
    if (!achados.length) return reply('🔎 Nada encontrado para `' + termo + '`.')
    // O tipo da busca não é o prefixo do comando: peças respondem por .trocar<x>.
    const ROTA = { luz: 'luz', peca: 'trocar', infracao: 'infracao', emergencia: 'emergencia' }
    let doc = cab('BUSCA: ' + termo.toUpperCase(), '🔎')
    doc += linha('Resultados', String(achados.length)) + '\n'
    for (const a of achados.slice(0, 25)) doc += '┃ [' + a.tipo + '] *' + a.nome + '*\n┃    `' + prefix + ROTA[a.tipo] + a.chave + '`\n'
    if (achados.length > 25) doc += '\n_+' + (achados.length - 25) + ' resultados. Refine a busca._'
    return reply(doc)
    }
}
