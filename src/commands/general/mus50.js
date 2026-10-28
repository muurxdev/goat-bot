/**
 * Comando .instrumentos — INSTRUMENTOS
 *
 * Instrumentos por família, com afinação e dificuldade.
 */

const M = require('../../services/musicService')

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
    name: 'instrumentos',
    aliases: ["listainstrumentos"],
    category: 'general',
    subcategory: 'Música',
    description: 'Instrumentos por família, com afinação e dificuldade',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const porFamilia = {}
    for (const [k, i] of Object.entries(M.INSTRUMENTOS)) {
        if (!porFamilia[i.familia]) porFamilia[i.familia] = []
        porFamilia[i.familia].push({ chave: k, ...i })
    }
    let doc = cab('INSTRUMENTOS', '🎼')
    doc += linha('Fichas', String(Object.keys(M.INSTRUMENTOS).length))
    doc += linha('Famílias', String(Object.keys(porFamilia).length)) + '\n'
    for (const [fam, lista] of Object.entries(porFamilia)) {
        doc += bloco(fam.toUpperCase(), lista.map(i => i.nome + ' (' + i.dificuldade + ') `' + prefix + 'instrumento' + i.chave + '`'))
    }
    doc += '\n🎶 _Gêneros:_ `' + prefix + 'generosmusicais`   🎓 _Teoria:_ `' + prefix + 'teoriamusical`'
    return reply(doc)
    }
}
