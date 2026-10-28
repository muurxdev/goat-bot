/**
 * Comando .modmodelo — MODELOS DE AVISO
 *
 * Textos prontos para a administração usar.
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
    name: 'modmodelo',
    aliases: ["modeloaviso","cmd_modmodelo","alt_modmodelo","atalho_modmodelo","abrev_modmodelo","call_modmodelo","func_modmodelo"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Textos prontos para a administração usar',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    let doc = cab('MODELOS DE AVISO', '📝')
    doc += bloco('1️⃣ PRIMEIRO AVISO', ['Percebemos uma conduta fora das regras. Este é um aviso amigável — leia as regras com `' + prefix + 'regrasgrupo`.'])
    doc += '\n' + bloco('2️⃣ AVISO SÉRIO', ['Segunda ocorrência registrada. A próxima leva a punição conforme as regras do grupo.'])
    doc += '\n' + bloco('3️⃣ ÚLTIMO AVISO', ['Você atingiu o limite. A próxima infração resulta em punição imediata.'])
    return reply(doc)
    }
}
