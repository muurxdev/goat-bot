/**
 * Comando .modescalada — ESCALADA DE PUNIÇÃO
 *
 * O que acontece na próxima infração.
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
    name: 'modescalada',
    aliases: ["proximapunicao","cmd_modescalada","alt_modescalada","atalho_modescalada","abrev_modescalada","call_modescalada","func_modescalada"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'O que acontece na próxima infração',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const alvo = alvoDe({ mentionedJid, quotedSender, args })
    if (!alvo) return reply(pedeAlvo(prefix, 'modescalada'))
    const n = M.advertencias(alvo)
    const c = M.config(from)
    const e = M.escaladaSugerida(from, n)
    let doc = cab('ESCALADA DE PUNIÇÃO', '📶')
    doc += linha('Membro', M.nomeCurto(alvo))
    doc += linha('Advertências', n + ' de ' + c.limiteAdvertencias)
    doc += linha('Nível', e.nivel)
    doc += linha('Próxima ação', e.acao)
    doc += '\n' + barra(Math.min(1, n / c.limiteAdvertencias))
    doc += '\n_' + e.texto + '_'
    return reply(doc, [alvo])
    }
}
