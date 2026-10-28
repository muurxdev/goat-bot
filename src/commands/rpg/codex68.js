/**
 * Comando .indiceracas — ÍNDICE DE RAÇAS
 *
 * Todas as raças e elementos do personagem.
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
    name: 'indiceracas',
    aliases: ["listaracas"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'Todas as raças e elementos do personagem',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = C.catalogo.racas(), e = C.catalogo.elementos()
    let doc = cab('ÍNDICE DE RAÇAS', '🧬')
    doc += bloco('🧬 RAÇAS', Object.entries(r).map(([k, x]) => (x.emoji || '') + ' ' + x.nome + ' — `' + prefix + 'raca' + k + '`'))
    doc += '\n' + bloco('🔮 ELEMENTOS', Object.entries(e).map(([k, x]) => (x.emoji || '') + ' ' + x.nome + ' — `' + prefix + 'elemento' + k + '`'))
    return reply(doc)
    }
}
