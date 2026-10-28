/**
 * Comando .figanimada3 — ANIMADA DE 3s
 *
 * Qualidade possível numa animação de 3 segundos.
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
    name: 'figanimada3',
    aliases: ["animada3s"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Qualidade possível numa animação de 3 segundos',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('Animada de 3s', '🎬')
    for (const fps of [10, 15, 20, 24, 30]) {
        const r = S.quadrosAnimada(3, fps)
        doc += '• ' + String(fps + ' fps').padEnd(8) + r.quadros + ' quadros · ' + r.kbPorQuadro.toFixed(1) + ' KB cada ' + (r.viavel ? '🟢' : '🔴') + '\n'
    }
    const melhor = S.quadrosAnimada(3, 15)
    doc += '\n_' + melhor.recomendacao + '_'
    return reply(doc)
    }
}
