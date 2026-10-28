/**
 * Comando .refbuscar — BUSCAR NA REFERÊNCIA
 *
 * Procura em todos os catálogos técnicos.
 */

const R = require('../../services/devReferenceService')

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
    name: 'refbuscar',
    aliases: ["procurarreferencia","cmd_refbuscar","alt_refbuscar","atalho_refbuscar","abrev_refbuscar","call_refbuscar","func_refbuscar"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Procura em todos os catálogos técnicos',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ').trim()
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'refbuscar sort`')
    const achados = R.procurar(termo)
    let doc = cab('BUSCAR NA REFERÊNCIA', '🔎')
    doc += linha('Termo', termo)
    doc += linha('Encontrados', String(achados.length)) + '\n'
    if (!achados.length) return reply(doc + '_Nada encontrado nos catálogos._')
    for (const a of achados) doc += '┃ [' + a.tipo + '] ' + a.nome + '\n'
    return reply(doc)
    }
}
