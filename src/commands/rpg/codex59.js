/**
 * Comando .escadachefes — ESCADA DOS CHEFES
 *
 * Os chefes do jogo em ordem de dificuldade.
 */

const C = require('../../services/rpgCodexService')

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

/** Desenha uma ficha do códice. */
function ficha(f, prefix) {
    if (!f) return '❌ Essa entrada não existe mais no catálogo do jogo.'
    let doc = cab(String(f.nome).toUpperCase(), '📖')
    doc += linha('Entrada', f.tipo) + '\n'
    for (const [rotulo, valor] of f.linhas) doc += linha(rotulo, valor)
    for (const lista of (f.listas || [])) {
        doc += '\n' + bloco(lista.titulo, lista.itens)
    }
    if (f.rodape) doc += '\n💡 _' + f.rodape + '_'
    return doc
}

module.exports = {
    name: 'escadachefes',
    aliases: ["ordemchefes"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'Os chefes do jogo em ordem de dificuldade',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const escada = C.escadaDeBosses()
    let doc = cab('ESCADA DOS CHEFES', '🪜')
    for (const b of escada) {
        doc += '┃ ' + b.nome + '\n'
        doc += '┃    ' + C.num(b.vida) + ' HP · efeito: ' + (b.efeito || 'nenhum') + '\n'
    }
    doc += '\n_Do mais fraco ao mais forte. O último tem ' + C.num(escada[escada.length - 1].vida) + ' de vida base._'
    return reply(doc)
    }
}
