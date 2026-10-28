/**
 * Comando .modlistanegra — CONFERIR LISTA NEGRA
 *
 * Verifica se um membro está bloqueado no bot.
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
    name: 'modlistanegra',
    aliases: ["naslistanegra","cmd_modlistanegra","alt_modlistanegra","atalho_modlistanegra","abrev_modlistanegra","call_modlistanegra","func_modlistanegra"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Confere se um membro está proibido de usar meus comandos',
    usage: '<@pessoa>',
    examples: ['@fulano — confere a situação da pessoa', '5511999999999 — confere pelo número'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const alvo = alvoDe({ mentionedJid, quotedSender, args })
    if (!alvo) return reply(pedeAlvo(prefix, 'modlistanegra'))
    const bloqueado = M.naListaNegra(alvo)
    let doc = cab('CONFERIR LISTA NEGRA', '🚫')
    doc += linha('Membro', M.nomeCurto(alvo))
    doc += linha('Situação', bloqueado ? '🚫 Proibido de usar meus comandos' : '🟢 Liberado')
    return reply(doc, [alvo])
    }
}
