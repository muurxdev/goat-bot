/**
 * Comando .orgaos — ÓRGÃOS
 *
 * Órgãos catalogados, agrupados por sistema.
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
    name: 'orgaos',
    aliases: ["listaorgaos"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Órgãos catalogados, agrupados por sistema',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const lista = filtro ? B.orgaosDe(filtro) : Object.entries(B.ORGAOS).map(([chave, o]) => ({ chave, ...o }))
    if (!lista.length) return reply('🧬 Nenhum órgão do sistema `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'orgaos`')
    const porSistema = {}
    for (const o of lista) {
        if (!porSistema[o.sistema]) porSistema[o.sistema] = []
        porSistema[o.sistema].push(o)
    }
    let doc = cab('ÓRGÃOS', '🧬')
    doc += linha('Fichas', String(lista.length)) + '\n'
    for (const [sis, os] of Object.entries(porSistema)) {
        doc += bloco(sis.toUpperCase(), os.map(o => o.nome + ' `' + prefix + 'orgao' + o.chave + '`'))
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'orgaos digestório`'
    return reply(doc)
    }
}
