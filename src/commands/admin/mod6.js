/**
 * Comando .modsilenciados — SILENCIADOS AGORA
 *
 * Quem está silenciado e por quanto tempo ainda.
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
    name: 'modsilenciados',
    aliases: ["silenciadosativos","cmd_modsilenciados","alt_modsilenciados","atalho_modsilenciados","abrev_modsilenciados","call_modsilenciados","func_modsilenciados"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Quem está silenciado e por quanto tempo ainda',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const s = M.silenciadosAtivos(from)
    let doc = cab('SILENCIADOS AGORA', '🔇')
    if (!s.length) return reply(F.tela({
        emoji: '🔇', titulo: 'Silenciados agora', prefix,
        intro: '🔊 Ninguém está silenciado neste grupo. Quando houver, aparece cada pessoa com o tempo que ainda falta e o motivo.',
        proximos: [
            { nome: 'mute', args: '@pessoa 10m motivo', oque: 'silencia alguém por um tempo' },
            { nome: 'modvencidos', oque: 'silenciamentos que já acabaram' }
        ]
    }))
    const mencoes = []
    for (const x of s) {
        mencoes.push(x.user_jid)
        const resta = x.restanteMs === null ? 'sem prazo' : M.duracao(x.restanteMs) + ' restantes'
        doc += '┃ ' + M.nomeCurto(x.user_jid) + ' — ' + resta + (x.reason ? ' · ' + x.reason : '') + '\n'
    }
    return reply(doc, mencoes)
    }
}
