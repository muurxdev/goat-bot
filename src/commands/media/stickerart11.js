/**
 * Comando .figajuste — COMO VAI FICAR
 *
 * Mostra como sua imagem fica ao virar figurinha.
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
    name: 'figajuste',
    aliases: ["comovaificar"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Mostra como sua imagem fica ao virar figurinha',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const l = parseInt(args[0], 10), a = parseInt(args[1], 10)
    if (!l || !a) return reply('📐 📌 Uso: `' + prefix + 'figajuste 1920 1080`\n\n_(largura e altura da sua imagem)_')
    const r = S.ajusteParaFigurinha(l, a)
    let doc = cab('Como vai ficar', '📐')
    doc += linha('Sua imagem', r.original + ' (' + r.orientacao + ')')
    doc += linha('Vai virar', r.redimensionada)
    doc += linha('Figurinha final', r.quadrada)
    doc += linha('Área aproveitada', r.areaAproveitada.toFixed(0) + '%')
    doc += '\n' + barra(r.areaAproveitada / 100) + '\n'
    if (r.precisaBorda) {
        doc += '\n🟡 _Vai sobrar borda transparente: '
        doc += r.bordaTopo ? r.bordaTopo + 'px em cima e embaixo' : r.bordaLateral + 'px nas laterais'
        doc += '. Corte a imagem em quadrado antes para aproveitar tudo._'
    } else doc += '\n🟢 _Imagem quadrada: aproveita a figurinha inteira._'
    return reply(doc)
    }
}
