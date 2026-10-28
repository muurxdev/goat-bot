/**
 * Comando .midiaresumo — ESTADO DA MÍDIA
 *
 * Panorama do subsistema de mídia.
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
    name: 'midiaresumo',
    aliases: ["estadomidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Panorama do subsistema de mídia',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = await M.ferramentas()
    const fila = M.fila()
    const t = M.pesoTemporario()
    const l = M.limites()
    let doc = cab('Estado da mídia', '🩺')
    doc += linha('Baixador', f.ytdlp ? '🟢' : '🔴')
    doc += linha('Conversor', f.ffmpeg ? '🟢' : '🔴')
    if (fila) doc += linha('Fila', (fila.emAndamento || 0) + '/' + (fila.limite || '?') + ' em andamento')
    doc += linha('Temporários', t.arquivos + ' arquivos · ' + M.tamanho(t.bytes))
    if (l.MAX_FILE_SIZE_BYTES) doc += linha('Limite de arquivo', M.tamanho(l.MAX_FILE_SIZE_BYTES))
    doc += linha('Sites suportados', String(M.sitesSuportados().length))
    return reply(doc)
    }
}
