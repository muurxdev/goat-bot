/**
 * Comando .obrasbrasileiras — OBRAS BRASILEIRAS
 *
 * Obras por dificuldade, com tamanho e ano.
 */

const L = require('../../services/literatureService')

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
    name: 'obrasbrasileiras',
    aliases: ["livrosbr"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Obras por dificuldade, com tamanho e ano',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const entradas = Object.entries(L.OBRAS).filter(([, o]) => !filtro || o.dificuldade.includes(filtro))
    if (!entradas.length) return reply('📕 Nada com `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'obrasbrasileiras`')
    const ordem = ['fácil', 'média', 'difícil', 'muito difícil']
    const porNivel = {}
    for (const [k, o] of entradas) {
        if (!porNivel[o.dificuldade]) porNivel[o.dificuldade] = []
        porNivel[o.dificuldade].push({ chave: k, ...o })
    }
    let doc = cab('OBRAS BRASILEIRAS', '📕')
    doc += linha('Obras', String(entradas.length)) + '\n'
    for (const nivel of ordem) {
        if (!porNivel[nivel]) continue
        doc += bloco(nivel.toUpperCase(), porNivel[nivel]
            .sort((a, b) => a.paginas - b.paginas)
            .map(o => o.titulo + ' — ' + o.paginas + 'p, ' + o.ano + ' `' + prefix + 'obra' + o.chave + '`'))
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'obrasbrasileiras fácil`'
    return reply(doc)
    }
}
