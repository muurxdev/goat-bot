/**
 * Comando .modvencidos — SILENCIAMENTOS VENCIDOS
 *
 * Registros de silêncio que já expiraram.
 */

const M = require('../../services/moderationService')
const F = require('../../utils/formato')

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
    name: 'modvencidos',
    aliases: ["silenciamentosvencidos","cmd_modvencidos","alt_modvencidos","atalho_modvencidos","abrev_modvencidos","call_modvencidos","func_modvencidos"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Registros de silêncio que já expiraram',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const v = M.silenciadosVencidos(from)
    let doc = cab('SILENCIAMENTOS VENCIDOS', '⌛')
    if (!v.length) return reply(F.tela({
        emoji: '⌛', titulo: 'Silenciamentos vencidos', prefix,
        intro: '🟢 Nenhum silenciamento vencido. Aqui aparecem os silêncios cujo prazo já acabou; eles não calam mais ninguém e ficam só como histórico.',
        proximos: [
            { nome: 'modsilenciados', oque: 'quem ainda está silenciado' },
            { nome: 'mutados', oque: 'lista de silenciados do grupo' }
        ]
    }))
    for (const x of v) doc += '┃ ' + M.nomeCurto(x.user_jid) + ' — venceu em ' + quando(x.expires_at) + '\n'
    doc += '\n_Registros vencidos não silenciam mais ninguém; ficam só como histórico._'
    return reply(doc)
    }
}
