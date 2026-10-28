/**
 * Comando .figpassoapasso — COMO FAZER FIGURINHA
 *
 * O passo a passo para criar uma figurinha boa.
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
    name: 'figpassoapasso',
    aliases: ["comofazerfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'O passo a passo para criar uma figurinha boa',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Como fazer figurinha', '🪄')
    doc += '1️⃣ *Escolha a imagem* — quadrada rende melhor. Veja `' + prefix + 'figajuste`.\n\n'
    doc += '2️⃣ *Assine o pacote* — `' + prefix + 'packnome` e `' + prefix + 'packautor`.\n\n'
    doc += '3️⃣ *Envie a imagem* respondendo com o comando de figurinha.\n\n'
    doc += '4️⃣ *Para animada* — no máximo ' + S.LIMITES.duracaoAnimadaSeg + 's. Confira com `' + prefix + 'figanimada`.\n\n'
    doc += '5️⃣ *Fundo transparente* — use `' + prefix + 'nobg` antes de criar.'
    return reply(doc)
    }
}
