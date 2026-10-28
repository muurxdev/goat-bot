/**
 * Comando .figajuda — GUIA DAS FIGURINHAS
 *
 * Todos os comandos de figurinha disponíveis.
 */

const S = require('../../services/stickerService')

function cab(titulo, emoji) {
    return emoji + ' *' + titulo + '*\n\n'
}
function linha(rotulo, valor) { return '*' + rotulo + ':* ' + valor + '\n' }
function sep() { return '\n' }
function bloco(titulo, itens) {
    let t = '*' + titulo + '*\n'
    for (const i of itens) t += '• ' + i + '\n'
    return t
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function semPacote(prefix) {
    return '_Você ainda não definiu a identidade do seu pacote._\n\n📌 Comece com: `' + prefix + 'packnome Meu Pacote`'
}

module.exports = {
    name: 'figajuda',
    aliases: ["guiafigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Todos os comandos de figurinha disponíveis',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Guia das figurinhas', '🗺️')
    doc += bloco('Seu pacote', [
        '`' + prefix + 'packnome` · `' + prefix + 'packautor`',
        '`' + prefix + 'packver` · `' + prefix + 'packperfis`',
        '`' + prefix + 'packsalvar` · `' + prefix + 'packusar`'
    ])
    doc += '\n' + bloco('Antes de criar', [
        '`' + prefix + 'figajuste` · `' + prefix + 'figanimada`',
        '`' + prefix + 'figlimites` · `' + prefix + 'figdicas`'
    ])
    doc += '\n' + bloco('Seus números', [
        '`' + prefix + 'figcontador` · `' + prefix + 'figestatisticas`',
        '`' + prefix + 'fighistorico`'
    ])
    doc += '\n' + bloco('Deu ruim', ['`' + prefix + 'figerros` · `' + prefix + 'figpassoapasso`'])
    return reply(doc)
    }
}
