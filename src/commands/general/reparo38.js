/**
 * Comando .reparoscasa — REPAROS DA CASA
 *
 * Problemas comuns e como resolver, por dificuldade.
 */

const H = require('../../services/homeRepairService')

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
    name: 'reparoscasa',
    aliases: ["consertos"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Problemas comuns e como resolver, por dificuldade',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const entradas = Object.entries(H.REPAROS).filter(([, r]) => !filtro || r.dificuldade.includes(filtro))
    if (!entradas.length) return reply('🔧 Nada com `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'reparoscasa`')
    const porNivel = {}
    for (const [k, r] of entradas) {
        if (!porNivel[r.dificuldade]) porNivel[r.dificuldade] = []
        porNivel[r.dificuldade].push({ chave: k, ...r })
    }
    let doc = cab('REPAROS DA CASA', '🔧')
    doc += linha('Fichas', String(entradas.length)) + '\n'
    for (const nivel of ['fácil', 'média', 'difícil']) {
        if (!porNivel[nivel]) continue
        doc += bloco(nivel.toUpperCase(), porNivel[nivel].map(r => r.nome + ' (' + r.tempo + ') `' + prefix + 'reparo' + r.chave + '`'))
    }
    doc += '\n⚠️ _Antes de mexer em elétrica ou gás:_ `' + prefix + 'segurancasnacasa`'
    return reply(doc)
    }
}
