/**
 * Comando .midiafila — FILA DE MÍDIA
 *
 * Quantos downloads estão na fila agora.
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
    name: 'midiafila',
    aliases: ["filamidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Quantos downloads estão na fila agora',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = M.fila()
    let doc = cab('Fila de mídia', '📋')
    if (!f) return reply(doc + '_Fila indisponível._')
    doc += linha('Aguardando', String(f.aguardando ?? 0))
    doc += linha('Em andamento', String(f.emAndamento ?? 0))
    doc += linha('Simultâneos permitidos', String(f.limite ?? '—'))
    doc += linha('Já processados', String(f.historico ?? 0))
    const ocupacao = f.limite ? (f.emAndamento || 0) / f.limite : 0
    doc += '\n' + barra(ocupacao) + ' de ocupação'
    return reply(doc)
    }
}
