/**
 * Comando .figtexto — TEXTO EM FIGURINHA
 *
 * Como escrever em figurinha e ficar legível.
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
    name: 'figtexto',
    aliases: ["textoemfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Como escrever em figurinha e ficar legível',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Texto em figurinha', '🔤')
    doc += linha('Tamanho da figurinha', S.LIMITES.ladoIdeal + '×' + S.LIMITES.ladoIdeal)
    doc += linha('Fonte mínima', '~40 pixels')
    doc += linha('Palavras por linha', 'no máximo 3')
    doc += linha('Linhas', 'no máximo 3')
    doc += '\n' + bloco('Regras', [
        'Contorno escuro em texto claro sempre ajuda',
        'Uma frase curta funciona melhor que uma explicação',
        'Deixe margem: o WhatsApp corta as pontas em alguns aparelhos'
    ])
    return reply(doc)
    }
}
