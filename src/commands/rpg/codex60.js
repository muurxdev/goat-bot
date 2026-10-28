/**
 * Comando .tabelapets — TABELA DE COMPANHEIROS
 *
 * Todos os pets, preço e o que cada um rende.
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
    name: 'tabelapets',
    aliases: ["comparapets"],
    category: 'rpg',
    subcategory: 'Códice',
    description: 'Todos os pets, preço e o que cada um rende',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const pets = C.tabelaDePets()
    let doc = cab('TABELA DE COMPANHEIROS', '🐾')
    for (const p of pets) {
        doc += '┃ ' + p.nome + ' _(' + p.tipo + ')_\n'
        doc += '┃    ' + (p.preco ? C.num(p.preco) + ' 🪙' : 'sem preço') +
            (p.bonusTotal ? ' · +' + p.bonusTotal + ' pontos de bônus' : '') + '\n'
    }
    const comCusto = pets.filter(p => p.custoPorPonto)
    if (comCusto.length) {
        const melhor = comCusto.sort((a, b) => a.custoPorPonto - b.custoPorPonto)[0]
        doc += '\n💡 _Melhor custo por ponto de bônus: ' + melhor.nome + '._'
    }
    return reply(doc)
    }
}
