/**
 * Comando .examehemograma — HEMOGRAMA COMPLETO
 *
 * Exame Hemograma completo: o que mede e para que serve.
 */

const B = require('../../services/bodyService')

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


module.exports = {
    name: 'examehemograma',
    aliases: ["entenderhemograma"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Exame Hemograma completo: o que mede e para que serve',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = B.EXAMES['hemograma']
    let doc = cab("HEMOGRAMA COMPLETO", '🧪')
    doc += linha('Jejum', e.jejum)
    doc += linha('Mede', e.mede)
    if (e.referencia !== '—') doc += linha('Referência comum', e.referencia)
    doc += sep()
    doc += '🎯 *Para que serve*\n' + e.paraque + '\n\n'
    doc += '_Valores de referência mudam por laboratório, idade e sexo. Quem interpreta o laudo é o médico._'
    doc += '\n\n🧪 _Todos os exames:_ `' + prefix + 'exames`'
    return reply(doc)
    }
}
