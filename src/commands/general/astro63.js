/**
 * Comando .luas — LUAS DO SISTEMA SOLAR
 *
 * Luas catalogadas, agrupadas por planeta.
 */

const A = require('../../services/astronomyService')

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
    name: 'luas',
    aliases: ["satelites"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Luas catalogadas, agrupadas por planeta',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const lista = filtro ? A.luasDe(filtro) : Object.entries(A.LUAS).map(([chave, l]) => ({ chave, ...l }))
    if (!lista.length) return reply('🌙 Nenhuma lua catalogada para `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'luas`')
    const porPlaneta = {}
    for (const l of lista) {
        if (!porPlaneta[l.planeta]) porPlaneta[l.planeta] = []
        porPlaneta[l.planeta].push(l)
    }
    let doc = cab('LUAS DO SISTEMA SOLAR', '🌙')
    doc += linha('Fichas', String(lista.length)) + '\n'
    for (const [p, ls] of Object.entries(porPlaneta)) {
        doc += bloco(p.toUpperCase(), ls.map(l => l.nome + ' — ' + l.diametro.toLocaleString('pt-BR') + ' km `' + prefix + 'lua' + l.chave + '`'))
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'luas jupiter`'
    return reply(doc)
    }
}
