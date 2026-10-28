/**
 * Comando .modestatisticas — NÚMEROS DA GUARDA
 *
 * Panorama da moderação deste grupo.
 */

const M = require('../../services/moderationService')

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

/** Resolve o alvo: menção, resposta ou número digitado. */
function alvoDe(ctx) {
    const marcado = (ctx.mentionedJid || [])[0]
    if (marcado) return marcado
    if (ctx.quotedSender) return ctx.quotedSender
    const bruto = (ctx.args || []).find(a => /^\+?\d{8,15}$/.test(String(a).replace(/\D/g, '')))
    if (bruto) return String(bruto).replace(/\D/g, '') + '@s.whatsapp.net'
    return null
}
function pedeAlvo(prefix, cmd) {
    return '🎯 *Quem?*\n\nMarque a pessoa, responda a uma mensagem dela ou informe o número.\n\n📌 Exemplo: `' + prefix + cmd + ' @fulano`'
}
function quando(ms) {
    if (!ms) return 'sem data'
    return new Date(Number(ms)).toLocaleString('pt-BR')
}

module.exports = {
    name: 'modestatisticas',
    aliases: ["estatisticasmod","cmd_modestatisticas","alt_modestatisticas","atalho_modestatisticas","abrev_modestatisticas","call_modestatisticas","func_modestatisticas"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Panorama da moderação deste grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from)
    const s = M.silenciadosAtivos(from)
    const a30 = M.porAcao(from, 30).reduce((acc, x) => acc + x.total, 0)
    const a7 = M.porAcao(from, 7).reduce((acc, x) => acc + x.total, 0)
    let doc = cab('NÚMEROS DA GUARDA', '📈')
    doc += linha('Ocorrências no livro', String(l.length))
    doc += linha('Nos últimos 30 dias', String(a30))
    doc += linha('Nos últimos 7 dias', String(a7))
    doc += linha('Silenciados agora', String(s.length))
    doc += linha('Membros com ficha', String(M.reincidentes(from, 999).length))
    return reply(doc)
    }
}
