/**
 * Comando .figglossario — GLOSSÁRIO DAS FIGURINHAS
 *
 * O que cada termo de figurinha significa.
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
    name: 'figglossario',
    aliases: ["termosfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'O que cada termo de figurinha significa',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Glossário das figurinhas', '📚')
    const termos = [
        ['Pacote', 'o conjunto que agrupa suas figurinhas no WhatsApp'],
        ['Autor', 'quem assina — aparece nas informações da figurinha'],
        ['Estática', 'figurinha parada, mais leve'],
        ['Animada', 'figurinha em movimento, com limite de tempo e peso'],
        ['Transparência', 'fundo invisível, sem retângulo branco'],
        ['Quadro', 'cada imagem que compõe uma animação'],
        ['Perfil', 'combinação de nome e autor salva para reutilizar']
    ]
    for (const [t, d] of termos) doc += '• *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
