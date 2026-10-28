/**
 * Comando .figtransparencia — FUNDO TRANSPARENTE
 *
 * Como conseguir figurinha sem fundo.
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
    name: 'figtransparencia',
    aliases: ["fundotransparente"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Como conseguir figurinha sem fundo',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Fundo transparente', '🫥')
    doc += '🖼️ *O formato aceita transparência* — figurinha com fundo branco é escolha, não limitação.\n\n'
    doc += bloco('Como fazer', [
        '1. Envie a imagem e use `' + prefix + 'nobg` para remover o fundo',
        '2. Transforme o resultado em figurinha',
        '3. Se sobrar borda branca, corte antes com `' + prefix + 'crop`'
    ])
    doc += '\n_Funciona melhor com pessoa ou objeto bem separado do fundo._'
    return reply(doc)
    }
}
