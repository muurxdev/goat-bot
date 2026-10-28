/**
 * Comando .buscardireito — BUSCA NA VIDA PRÁTICA
 *
 * Procura documento, direito, socorro ou golpe.
 */

const C = require('../../services/civicService')

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
    name: 'buscardireito',
    aliases: ["procurarajuda"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Procura documento, direito, socorro ou golpe',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ')
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'buscardireito pix`')
    const achados = C.procurar(termo)
    if (!achados.length) return reply('🔎 Nada encontrado para `' + termo + '`.')
    let doc = cab('BUSCA: ' + termo.toUpperCase(), '🔎')
    doc += linha('Resultados', String(achados.length)) + '\n'
    for (const a of achados) {
        doc += '┃ [' + a.tipo + '] *' + a.nome + '*\n┃    `' + prefix + a.tipo + a.chave.toLowerCase() + '`\n'
    }
    return reply(doc)
    }
}
