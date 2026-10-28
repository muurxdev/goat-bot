/**
 * Comando .figdicas — DICAS DE FIGURINHA
 *
 * O que separa uma figurinha boa de uma ruim.
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
    name: 'figdicas',
    aliases: ["dicasfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'O que separa uma figurinha boa de uma ruim',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Dicas de figurinha', '💡')
    doc += bloco('Faça', [
        'Corte a imagem em quadrado antes',
        'Prefira imagem com o assunto centralizado',
        'Use fundo transparente quando possível',
        'Animação curta: 3 a 5 segundos rende melhor'
    ])
    doc += '\n' + bloco('Evite', [
        'Imagem muito larga: vira uma faixa fina',
        'Texto pequeno: some no tamanho de figurinha',
        'Animação de 10s: fica granulada',
        'Imagem escura com fundo escuro'
    ])
    return reply(doc)
    }
}
