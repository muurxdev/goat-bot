/**
 * Comando .modlimite — LIMITE DE ADVERTÊNCIAS
 *
 * Define quantas advertências antes da punição.
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
    name: 'modlimite',
    aliases: ["limiteadvertencias","cmd_modlimite","alt_modlimite","atalho_modlimite","abrev_modlimite","call_modlimite","func_modlimite"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Define quantas advertências antes da punição',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só a administração muda a configuração da guarda.')
    const n = parseInt(args[0], 10)
    if (!n || n < 1 || n > 20) return reply('🔢 Informe um número de 1 a 20.\n\n📌 Exemplo: `' + prefix + 'modlimite 3`')
    M.salvarConfig(from, { limiteAdvertencias: n })
    return reply('🔢 *Limite ajustado:* ' + n + ' advertências antes da punição.')
    }
}
