/**
 * Comando .indiceclasses — ÍNDICE DE CLASSES
 *
 * Todas as classes comuns e lendárias.
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
    name: 'indiceclasses',
    aliases: ["listaclasses"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'Todas as classes comuns e lendárias',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const comuns = C.catalogo.classes(), lend = C.catalogo.lendarias()
    let doc = cab('ÍNDICE DE CLASSES', '🎭')
    doc += bloco('⚔️ COMUNS', Object.entries(comuns).map(([k, c]) => c.nome + ' — `' + prefix + 'classe' + k + '`'))
    doc += '\n' + bloco('🌟 LENDÁRIAS', Object.entries(lend).map(([k, c]) => c.nome + ' — `' + prefix + 'lendaria' + k.replace(/[^a-z0-9]/gi, '') + '`'))
    return reply(doc)
    }
}
