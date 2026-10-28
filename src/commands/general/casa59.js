/**
 * Comando .plantas — PLANTAS DE CASA
 *
 * Todas as plantas por nível de dificuldade.
 */

const H = require('../../services/homeLifeService')

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
    name: 'plantas',
    aliases: ["listaplantas"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Todas as plantas por nível de dificuldade',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const lista = filtro ? H.plantasPorDificuldade(filtro) : Object.entries(H.PLANTAS).map(([chave, p]) => ({ chave, ...p }))
    if (!lista.length) return reply('🪴 Nenhuma planta `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'plantas`')
    const porNivel = {}
    for (const p of lista) {
        if (!porNivel[p.dificuldade]) porNivel[p.dificuldade] = []
        porNivel[p.dificuldade].push(p)
    }
    let doc = cab('PLANTAS DE CASA', '🪴')
    doc += linha('Fichas', String(lista.length)) + '\n'
    for (const [nivel, ps] of Object.entries(porNivel)) {
        doc += bloco(nivel.toUpperCase(), ps.map(p => (p.toxica ? '⚠️ ' : '✅ ') + p.nome + ' `' + prefix + 'planta' + p.chave + '`'))
    }
    doc += '\n✅ não tóxica · ⚠️ tóxica se ingerida\n'
    doc += '💡 _Filtrar:_ `' + prefix + 'plantas fácil`'
    return reply(doc)
    }
}
