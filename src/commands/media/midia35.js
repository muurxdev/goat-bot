/**
 * Comando .midiatabelaaudio — TABELA DE ÁUDIO
 *
 * Peso do áudio por qualidade e duração.
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
    name: 'midiatabelaaudio',
    aliases: ["tabelaaudio"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Peso do áudio por qualidade e duração',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Tabela de áudio', '📊')
    doc += '`kbps   1min    5min    30min`\n'
    for (const kbps of Object.keys(M.TAXAS_AUDIO)) {
        doc += '• ' + kbps.padEnd(6)
        for (const min of [1, 5, 30]) doc += M.tamanho(M.pesoEstimado(Number(kbps), min * 60)).padEnd(8)
        doc += '\n'
    }
    return reply(doc)
    }
}
