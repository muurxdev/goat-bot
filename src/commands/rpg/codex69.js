/**
 * Comando .codice — CÓDICE DO RPG
 *
 * O índice de tudo que o códice sabe.
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
    name: 'codice',
    aliases: ["guiacodice"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'O índice de tudo que o códice sabe',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = C.catalogo
    let doc = cab('CÓDICE DO RPG', '📖')
    doc += linha('Classes', String(Object.keys(c.classes()).length + Object.keys(c.lendarias()).length))
    doc += linha('Mundos', String(Object.keys(c.mundos()).length))
    doc += linha('Chefes', String(Object.keys(c.bosses()).length))
    doc += linha('Companheiros', String(Object.keys(c.pets()).length))
    doc += linha('Raças e elementos', String(Object.keys(c.racas()).length + Object.keys(c.elementos()).length))
    doc += linha('Itens de loot', String(C.todoOLoot().length))
    doc += '\n' + bloco('📚 ÍNDICES', [
        '`' + prefix + 'indiceclasses` · `' + prefix + 'indicemundos`',
        '`' + prefix + 'indicechefes` · `' + prefix + 'indicepets`',
        '`' + prefix + 'indiceracas`'
    ])
    doc += '\n' + bloco('🔎 CONSULTAS', [
        '`' + prefix + 'ondeconseguir <item>` — de onde cai',
        '`' + prefix + 'rotamundos` — ordem de progressão',
        '`' + prefix + 'escadachefes` — dificuldade dos chefes',
        '`' + prefix + 'lootraro` — os itens mais difíceis'
    ])
    return reply(doc)
    }
}
