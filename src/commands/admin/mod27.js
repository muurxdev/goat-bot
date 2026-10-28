/**
 * Comando .modaviso — AVISO FORMAL
 *
 * Monta um aviso público padronizado para o membro.
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
    name: 'modaviso',
    aliases: ["avisoformal","cmd_modaviso","alt_modaviso","atalho_modaviso","abrev_modaviso","call_modaviso","func_modaviso"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Monta um aviso público padronizado para o membro',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só a administração emite avisos formais.')
    const alvo = alvoDe({ mentionedJid, quotedSender, args })
    if (!alvo) return reply(pedeAlvo(prefix, 'modaviso'))
    const motivo = args.filter(a => !/^@/.test(a) && !/^\d{8,}$/.test(a)).join(' ').trim() || 'descumprimento das regras'
    const n = M.advertencias(alvo)
    const c = M.config(from)
    M.registrar(from, { alvo, autor: sender, acao: 'aviso formal', motivo })
    let doc = '📣 *AVISO FORMAL DA GUARDA*\n\n'
    doc += '@' + String(alvo).split('@')[0] + ', a administração registra um aviso formal.\n\n'
    doc += linha('Motivo', motivo)
    doc += linha('Advertências', n + ' de ' + c.limiteAdvertencias)
    doc += '\n_Ao atingir o limite, a guarda vai ' + c.punicaoNoLimite + '._'
    return reply(doc, [alvo])
    }
}
