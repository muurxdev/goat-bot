/**
 * Comando .fig43 — 4:3 PARA FIGURINHA
 *
 * Como uma imagem 4:3 fica ao virar figurinha.
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
    name: 'fig43',
    aliases: ["cortar43"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Como uma imagem 4:3 fica ao virar figurinha',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const base = parseInt(args[0], 10) || 1920
    const largura = base
    const altura = Math.round(base * 3 / 4)
    const r = S.ajusteParaFigurinha(largura, altura)
    let doc = cab('4:3 para figurinha', '✂️')
    doc += linha('Imagem', r.original)
    doc += linha('Dentro da figurinha', r.redimensionada)
    doc += linha('Área aproveitada', r.areaAproveitada.toFixed(0) + '%')
    doc += '\n' + barra(r.areaAproveitada / 100) + '\n'
    doc += '\n_Para aproveitar 100%, recorte um quadrado de ' + Math.min(largura, altura) + '×' + Math.min(largura, altura) + ' antes._'
    return reply(doc)
    }
}
