/**
 * Comando .listaesportes — ESPORTES
 *
 * Todos os esportes com regras e origem.
 */

const L = require('../../services/lifestyleService')

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
    name: 'listaesportes',
    aliases: ["esportario"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Todos os esportes com regras e origem',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('ESPORTES', '🏟️')
    doc += linha('Modalidades', String(Object.keys(L.ESPORTES).length)) + '\n'
    for (const e of Object.values(L.ESPORTES)) {
        doc += '┃ *' + e.nome + '* — ' + e.jogadores + '\n┃    `' + prefix + 'esporte' + e.nome.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase() + '`\n'
    }
    doc += '\n🏅 _Cada ficha traz regra, duração, origem e curiosidade._'
    return reply(doc)
    }
}
