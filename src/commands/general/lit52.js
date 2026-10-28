/**
 * Comando .literaturadoano — O QUE SE ESCREVIA EM
 *
 * Diz qual escola literária dominava um ano.
 */

const L = require('../../services/literatureService')

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
    name: 'literaturadoano',
    aliases: ["escolade"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Diz qual escola literária dominava um ano',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const ano = parseInt(args[0], 10)
    const escolas = L.escolaDoAno(ano)
    if (!escolas) {
        let doc = cab('O QUE SE ESCREVIA EM', '📅')
        doc += '📌 Uso: `' + prefix + 'literaturadoano 1930`\n\n'
        doc += '_O catálogo cobre de 1601 até hoje._'
        return reply(doc)
    }
    let doc = cab('LITERATURA EM ' + ano, '📅')
    if (escolas.length > 1) doc += '_Ano de fronteira: duas escolas convivem._\n\n'
    for (const e of escolas) {
        doc += '┃ *' + e.nome + '* (' + e.inicio + '—' + (e.fim === null ? 'hoje' : e.fim) + ')\n'
        doc += '┃    ' + e.traco.split('.')[0] + '.\n'
        doc += '┃    `' + prefix + 'escola' + e.chave + '`\n'
    }
    const obras = Object.entries(L.OBRAS).filter(([, o]) => Math.abs(o.ano - ano) <= 10)
    if (obras.length) {
        doc += '\n' + bloco('📕 PUBLICADO POR PERTO', obras
            .sort((a, b) => a[1].ano - b[1].ano)
            .map(([k, o]) => o.ano + ' — ' + o.titulo + ' `' + prefix + 'obra' + k + '`'))
    }
    return reply(doc)
    }
}
