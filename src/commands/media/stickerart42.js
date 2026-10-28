/**
 * Comando .fig3000x2000 — IMAGEM 3000×2000
 *
 * Como uma imagem 3000×2000 (foto de câmera) vira figurinha.
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
    name: 'fig3000x2000',
    aliases: ["ajuste3000x2000"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Como uma imagem 3000×2000 (foto de câmera) vira figurinha',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const r = S.ajusteParaFigurinha(3000, 2000)
    let doc = cab('Imagem 3000×2000', '🖼️')
    doc += linha('Descrição', 'foto de câmera')
    doc += linha('Orientação', r.orientacao)
    doc += linha('Dentro da figurinha', r.redimensionada)
    doc += linha('Área aproveitada', r.areaAproveitada.toFixed(0) + '%')
    doc += '\n' + barra(r.areaAproveitada / 100) + '\n'
    doc += '\n_' + (r.precisaBorda ? 'Vai sobrar borda transparente.' : 'Aproveita a figurinha inteira.') + '_'
    return reply(doc)
    }
}
