/**
 * Comando .midiaferramentas — FERRAMENTAS DE MÍDIA
 *
 * Se as ferramentas de download estão disponíveis.
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
    name: 'midiaferramentas',
    aliases: ["ferramentasmidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Se as ferramentas de download estão disponíveis',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = await M.ferramentas()
    let doc = cab('Ferramentas de mídia', '🔧')
    doc += linha('Baixador de vídeo', f.ytdlp === null ? 'não verificado' : f.ytdlp ? '🟢 disponível' : '🔴 ausente')
    doc += linha('Conversor de mídia', f.ffmpeg === null ? 'não verificado' : f.ffmpeg ? '🟢 disponível' : '🔴 ausente')
    if (f.erro) doc += linha('Aviso', f.erro)
    if (f.ytdlp === false || f.ffmpeg === false) {
        doc += '\n🔴 _Sem essas ferramentas, download e conversão não funcionam._'
    }
    return reply(doc)
    }
}
