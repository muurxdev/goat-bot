/**
 * Comando .qualidadetexto — QUALIDADE DO TEXTO
 *
 * Nota geral de clareza e variedade.
 */

const T = require('../../services/textAnalysisService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

/** Texto a analisar: argumentos ou a mensagem respondida. */
function textoDe(args, quotedText) {
    const a = (args || []).join(' ').trim()
    return a || String(quotedText || '').trim()
}
function pedeTexto(prefix, cmd) {
    return '📝 *Preciso de um texto.*\n\nEnvie junto ao comando ou responda a uma mensagem.\n\n📌 Exemplo: `' + prefix + cmd + ' seu texto aqui`'
}
function listaBarras(itens, rotuloDe, valorDe, largura) {
    if (!itens.length) return '_nada a mostrar_\n'
    const maior = valorDe(itens[0]) || 1
    let t = ''
    for (const i of itens) {
        const n = valorDe(i)
        t += '┃ ' + String(rotuloDe(i)).slice(0, largura).padEnd(largura + 1) + '█'.repeat(Math.max(1, Math.round(n / maior * 10))) + ' ' + n + '\n'
    }
    return t
}

module.exports = {
    name: 'qualidadetexto',
    aliases: ["notatexto"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'Nota geral de clareza e variedade',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const texto = textoDe(args, quotedText)
    if (!texto) return reply(pedeTexto(prefix, 'qualidadetexto'))
    const m = T.medidas(texto)
    const l = T.legibilidade(texto)
    const s = T.sinaisDeSpam(texto)
    let nota = 50
    const notas = []
    if (l.indice !== null && l.indice >= 50) { nota += 20; notas.push('🟢 Fácil de ler') } else notas.push('🟡 Leitura pesada')
    if (m.riqueza >= 60) { nota += 15; notas.push('🟢 Vocabulário variado') } else notas.push('🟡 Muita repetição')
    if (m.mediaPalavrasPorFrase <= 22) { nota += 15; notas.push('🟢 Frases no tamanho certo') } else notas.push('🟡 Frases longas')
    if (s.sinais.length) { nota -= 15 * s.sinais.length; notas.push('🔴 ' + s.sinais.length + ' sinal(is) de propaganda') }
    nota = Math.max(0, Math.min(100, nota))
    let doc = cab('QUALIDADE DO TEXTO', '⭐')
    doc += linha('Nota', nota + '/100')
    doc += '\n' + barra(nota / 100) + '\n\n'
    for (const n of notas) doc += '┃ ' + n + '\n'
    return reply(doc)
    }
}
