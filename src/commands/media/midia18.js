/**
 * Comando .bitrateideal — TAXA IDEAL
 *
 * Qual qualidade usar para caber num tamanho.
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
    name: 'bitrateideal',
    aliases: ["qualtaxausar"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Qual qualidade usar para caber num tamanho',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const mb = parseFloat(String(args[0] || '').replace(',', '.'))
    const seg = segundosDe(args[1])
    if (!mb || !seg) return reply('🎯 📌 Uso: `' + prefix + 'bitrateideal 16 3:45`\n\n_(tamanho alvo em MB e duração)_')
    const kbps = Math.floor((mb * 1024 * 1024 * 8) / seg / 1000)
    let doc = cab('Taxa ideal', '🎯')
    doc += linha('Alvo', mb + ' MB')
    doc += linha('Duração', M.formatarDuracao(seg))
    doc += sep()
    doc += linha('Taxa máxima', kbps + ' kbps')
    const audio = Object.keys(M.TAXAS_AUDIO).filter(k => Number(k) <= kbps).pop()
    if (audio) doc += linha('Áudio recomendado', audio + ' kbps')
    const video = Object.entries(M.TAXAS_VIDEO).filter(([, i]) => i.kbps <= kbps).pop()
    if (video) doc += linha('Vídeo recomendado', video[0])
    return reply(doc)
    }
}
