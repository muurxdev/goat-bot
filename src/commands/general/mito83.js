/**
 * Comando .comparardeuses — COMPARAR DEUSES
 *
 * Põe dois deuses lado a lado com domínio e mito.
 */

const M = require('../../services/mythologyService')

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
    name: 'comparardeuses',
    aliases: ["duelodeuses"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Põe dois deuses lado a lado com domínio e mito',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = String(args[0] || '').toLowerCase()
    const b = String(args[1] || '').toLowerCase()
    if (!a || !b) return reply('⚔️ 📌 Uso: `' + prefix + 'comparardeuses zeus odin`')
    const achar = n => {
        const alvo = n.normalize('NFD').replace(/[^a-z0-9]/gi, '')
        for (const [k, d] of Object.entries(M.DEUSES)) {
            const kk = k.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase()
            if (kk === alvo || d.nome.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/gi, '') === alvo) return d
        }
        return null
    }
    const d1 = achar(a), d2 = achar(b)
    if (!d1 || !d2) return reply('⚔️ Não encontrei ' + (!d1 ? a : b) + '.\n\n📌 Veja os panteões: `' + prefix + 'panteoes`')
    let doc = cab('COMPARAR DEUSES', '⚔️')
    for (const d of [d1, d2]) {
        const p = M.PANTEOES[d.panteao]
        doc += bloco(p.emoji + ' ' + d.nome.toUpperCase(), [
            'Panteão: ' + p.nome,
            'Domínio: ' + d.dominio,
            'Símbolos: ' + d.simbolo
        ])
    }
    const cruz = d1.dominio.toLowerCase().split(/[,\s]+/).filter(w => w.length > 3 && d2.dominio.toLowerCase().includes(w))
    doc += '\n🔗 *Em comum:* ' + (cruz.length ? cruz.join(', ') : 'nada evidente entre os domínios')
    return reply(doc)
    }
}
