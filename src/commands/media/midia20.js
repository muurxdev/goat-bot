/**
 * Comando .midiaajuda — GUIA DA MÍDIA
 *
 * Todos os comandos de informação de mídia.
 */

const M = require('../../services/mediaInfoService')

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

function segundosDe(txt) {
    const s = M.lerDuracao(txt)
    return s && s > 0 ? s : null
}

module.exports = {
    name: 'midiaajuda',
    aliases: ["guiamidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Todos os comandos de informação de mídia',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Guia da mídia', '🗺️')
    doc += bloco('Formatos', [
        '`' + prefix + 'midiaformatos` · `' + prefix + 'formatosaudio`',
        '`' + prefix + 'formatosvideo` · `' + prefix + 'formatosimagem`'
    ])
    doc += '\n' + bloco('Tamanho', [
        '`' + prefix + 'pesoaudio` · `' + prefix + 'pesovideo`',
        '`' + prefix + 'cabeenvio` · `' + prefix + 'bitrateideal`'
    ])
    doc += '\n' + bloco('Dimensões', [
        '`' + prefix + 'calcularproporcao2` · `' + prefix + 'calcularescala`',
        '`' + prefix + 'resolucoes` · `' + prefix + 'proporcoes`'
    ])
    doc += '\n' + bloco('Estado', [
        '`' + prefix + 'midiaferramentas` · `' + prefix + 'midiafila`',
        '`' + prefix + 'midialimites` · `' + prefix + 'midiasites`'
    ])
    return reply(doc)
    }
}
