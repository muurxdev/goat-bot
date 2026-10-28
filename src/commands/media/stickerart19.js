/**
 * Comando .figerros — PROBLEMAS COMUNS
 *
 * Por que sua figurinha saiu ruim.
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
    name: 'figerros',
    aliases: ["problemasfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Por que sua figurinha saiu ruim',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Problemas comuns', '🔍')
    const casos = [
        ['Ficou achatada', 'a imagem não era quadrada e foi esticada'],
        ['Ficou pequena no meio', 'imagem muito larga ou muito alta: sobrou borda'],
        ['Perdeu qualidade', 'a imagem original já era pequena, ou a animação é longa demais'],
        ['Fundo branco', 'o original não tinha transparência — use `remover fundo` antes'],
        ['Animada não funcionou', 'passou de ' + S.LIMITES.duracaoAnimadaSeg + 's ou de ' + S.LIMITES.pesoAnimadaKb + ' KB'],
        ['Texto ilegível', 'letra pequena demais para 512 pixels']
    ]
    for (const [p, causa] of casos) doc += '• *' + p + '*\n   ' + causa + '\n\n'
    return reply(doc)
    }
}
