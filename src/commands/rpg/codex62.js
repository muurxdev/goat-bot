/**
 * Comando .todoloot — TODO O LOOT
 *
 * Todos os itens que caem no jogo.
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
    name: 'todoloot',
    aliases: ["listaloot"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'Todos os itens que caem no jogo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const loot = C.todoOLoot()
    const pagina = Math.max(1, parseInt(args[0], 10) || 1)
    const porPagina = 25
    const total = Math.ceil(loot.length / porPagina)
    const fatia = loot.slice((pagina - 1) * porPagina, pagina * porPagina)
    let doc = cab('TODO O LOOT', '🎁')
    doc += linha('Itens distintos', String(loot.length))
    doc += linha('Página', pagina + ' de ' + total) + '\n'
    for (const l of fatia) doc += '┃ ' + l.nome + ' — ' + C.chanceTexto(l.chance) + '\n'
    if (pagina < total) doc += '\n💡 _Próxima:_ `' + prefix + 'todoloot ' + (pagina + 1) + '`'
    return reply(doc)
    }
}
