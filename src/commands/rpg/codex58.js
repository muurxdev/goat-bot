/**
 * Comando .rotamundos — ROTA DOS MUNDOS
 *
 * A ordem em que os mundos se abrem.
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
    name: 'rotamundos',
    aliases: ["progressaomundos"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'A ordem em que os mundos se abrem',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const rota = C.rotaDeMundos()
    let doc = cab('ROTA DOS MUNDOS', '🧭')
    for (const m of rota) {
        doc += '┃ *Nv. ' + String(m.minLevel).padStart(3) + '* ' + m.nome + '\n'
        doc += '┃      ' + m.monstros + ' monstros · ' + Math.round(m.xpMedio) + ' XP em média\n'
    }
    doc += '\n💡 _Detalhe de um mundo:_ `' + prefix + 'mundo' + rota[0].chave + '`'
    return reply(doc)
    }
}
