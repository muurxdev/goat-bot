/**
 * Comando .qualunidade — QUAL É ESSA UNIDADE
 *
 * Descobre a que categoria uma unidade pertence.
 */

const U = require('../../services/unitsService')

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
    name: 'qualunidade',
    aliases: ["acharunidade"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Descobre a que categoria uma unidade pertence',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const sigla = String(args[0] || '').toLowerCase()
    if (!sigla) return reply('🔎 📌 Uso: `' + prefix + 'qualunidade psi`')
    if (U.TEMPERATURAS[sigla]) {
        const t = U.TEMPERATURAS[sigla]
        let doc = cab('QUAL É ESSA UNIDADE', '🔎')
        doc += linha('Sigla', sigla)
        doc += linha('Nome', t.nome + ' (' + t.simbolo + ')')
        doc += linha('Categoria', 'Temperatura')
        doc += linha('Sobre', t.nota)
        return reply(doc)
    }
    const cat = U.categoriaDe(sigla)
    if (!cat) return reply('🔎 A unidade `' + sigla + '` não está no catálogo.\n\n📌 Veja tudo: `' + prefix + 'catalogounidades`')
    const info = cat.unidades[sigla]
    let doc = cab('QUAL É ESSA UNIDADE', '🔎')
    doc += linha('Sigla', sigla)
    doc += linha('Nome', info.nome)
    doc += linha('Categoria', cat.emoji + ' ' + cat.nome)
    doc += linha('Sobre', info.nota)
    doc += linha('Em ' + cat.base, U.formatar(info.fator))
    doc += '\n💡 _Equivalências:_ `' + prefix + 'unidade' + sigla + '`'
    return reply(doc)
    }
}
