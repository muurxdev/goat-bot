/**
 * Comando .nutrientes — NUTRIENTES
 *
 * Vitaminas, minerais e macronutrientes por tipo.
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
    name: 'nutrientes',
    aliases: ["vitaminas"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Vitaminas, minerais e macronutrientes por tipo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const lista = filtro ? B.nutrientesPorTipo(filtro) : Object.entries(B.NUTRIENTES).map(([chave, n]) => ({ chave, ...n }))
    if (!lista.length) return reply('🥗 Nada do tipo `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'nutrientes`')
    const porTipo = {}
    for (const n of lista) {
        if (!porTipo[n.tipo]) porTipo[n.tipo] = []
        porTipo[n.tipo].push(n)
    }
    let doc = cab('NUTRIENTES', '🥗')
    doc += linha('Fichas', String(lista.length)) + '\n'
    for (const [tipo, ns] of Object.entries(porTipo)) {
        doc += bloco(tipo.toUpperCase(), ns.map(n => n.nome + ' — ' + n.papel + ' `' + prefix + 'nutriente' + n.chave + '`'))
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'nutrientes mineral`'
    return reply(doc)
    }
}
