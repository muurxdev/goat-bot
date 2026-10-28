/**
 * Comando .porquefalhou — POR QUE FALHOU
 *
 * Guia de diagnóstico quando o download não funciona.
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
    name: 'porquefalhou',
    aliases: ["erromidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Guia de diagnóstico quando o download não funciona',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = await M.ferramentas()
    const l = M.limites()
    let doc = cab('Por que falhou', '🔍')
    doc += bloco('Ferramentas', [
        'Baixador: ' + (f.ytdlp ? '🟢 ok' : '🔴 ausente'),
        'Conversor: ' + (f.ffmpeg ? '🟢 ok' : '🔴 ausente')
    ])
    doc += '\n' + bloco('Causas comuns', [
        'O vídeo é privado ou foi removido',
        'O arquivo passa de ' + (l.MAX_FILE_SIZE_BYTES ? M.tamanho(l.MAX_FILE_SIZE_BYTES) : 'do limite'),
        'O site não está na lista de suportados',
        'O endereço da máquina foi bloqueado pelo site',
        'A fila está cheia — tente de novo em instantes'
    ])
    doc += '\n' + bloco('O que tentar', [
        'Enviar o link completo, não o encurtado',
        'Pedir qualidade menor',
        'Conferir `' + prefix + 'midiasites`'
    ])
    return reply(doc)
    }
}
