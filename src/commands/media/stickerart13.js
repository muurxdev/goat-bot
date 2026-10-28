/**
 * Comando .figlimites — LIMITES DA FIGURINHA
 *
 * As regras do formato de figurinha.
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
    name: 'figlimites',
    aliases: ["limitesfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'As regras do formato de figurinha',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const L = S.LIMITES
    let doc = cab('Limites da figurinha', '🚧')
    doc += linha('Tamanho ideal', L.ladoIdeal + '×' + L.ladoIdeal + ' pixels')
    doc += linha('Peso (estática)', 'até ' + L.pesoEstaticaKb + ' KB')
    doc += linha('Peso (animada)', 'até ' + L.pesoAnimadaKb + ' KB')
    doc += linha('Duração (animada)', 'até ' + L.duracaoAnimadaSeg + ' segundos')
    doc += linha('Quadros por segundo', 'até ' + L.quadrosPorSegundo)
    doc += linha('Formato', 'webp, sempre quadrado')
    return reply(doc)
    }
}
