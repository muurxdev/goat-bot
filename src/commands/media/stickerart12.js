/**
 * Comando .figanimada — FIGURINHA ANIMADA
 *
 * Calcula se a animação cabe no formato.
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
    name: 'figanimada',
    aliases: ["calculoanimada"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Calcula se a animação cabe no formato',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const seg = parseFloat(String(args[0] || '').replace(',', '.')) || 5
    const fps = parseInt(args[1], 10) || S.LIMITES.quadrosPorSegundo
    const r = S.quadrosAnimada(seg, fps)
    let doc = cab('Figurinha animada', '🎞️')
    doc += linha('Duração', r.segundos + 's')
    doc += linha('Quadros por segundo', String(r.fps))
    doc += linha('Total de quadros', String(r.quadros))
    doc += linha('Peso por quadro', r.kbPorQuadro.toFixed(1) + ' KB')
    doc += linha('Viável', r.viavel ? '🟢 Sim' : '🔴 Não')
    doc += '\n_' + r.recomendacao + '_'
    doc += '\n\n📌 Limite do formato: ' + S.LIMITES.duracaoAnimadaSeg + 's e ' + S.LIMITES.pesoAnimadaKb + ' KB.'
    return reply(doc)
    }
}
