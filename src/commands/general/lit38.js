/**
 * Comando .obravidassecas — VIDAS SECAS
 *
 * Obra: Vidas Secas (1938).
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
    name: 'obravidassecas',
    aliases: ["livrovidassecas"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Obra: Vidas Secas (1938)',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const o = L.OBRAS['vidassecas']
    const a = L.AUTORES[o.autor]
    let doc = cab("VIDAS SECAS", '📕')
    doc += linha('Autor', a.nome)
    doc += linha('Ano', String(o.ano))
    doc += linha('Tamanho', '~' + o.paginas + ' páginas')
    doc += linha('Dificuldade', o.dificuldade)
    doc += sep()
    doc += '📖 *Do que trata*\n' + o.oquee + '\n\n'
    doc += '🎯 *Por que importa*\n' + o.porque + '\n\n'
    doc += '💡 *Dica de leitura*\n' + o.dica + '\n\n'
    doc += '✍️ _Sobre o autor:_ `' + prefix + 'autor' + o.autor + '`   📚 _Roteiros:_ `' + prefix + 'roteiroleitura`'
    return reply(doc)
    }
}
