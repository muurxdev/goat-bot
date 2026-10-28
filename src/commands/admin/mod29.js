/**
 * Comando .modregrasguarda — COMO A GUARDA FUNCIONA
 *
 * Explica o sistema de moderação do grupo.
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
    name: 'modregrasguarda',
    aliases: ["comofuncionaguarda","cmd_modregrasguarda","alt_modregrasguarda","atalho_modregrasguarda","abrev_modregrasguarda","call_modregrasguarda","func_modregrasguarda"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Explica o sistema de moderação do grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const c = M.config(from)
    let doc = cab('COMO A GUARDA FUNCIONA', '📖')
    doc += '⚠️ *Advertências* — cada infração soma uma. O limite deste grupo é *' + c.limiteAdvertencias + '*.\n\n'
    doc += '⚖️ *No limite* — ao atingir, a guarda vai *' + c.punicaoNoLimite + '*.\n\n'
    doc += '🔇 *Silêncio* — dura *' + c.tempoSilencioMin + ' minutos* por padrão.\n\n'
    doc += '📜 *Livro de ocorrências* — tudo fica registrado e pode ser consultado com `' + prefix + 'modhistorico`.\n\n'
    doc += '🛡️ *Isentos* — ' + ((c.isentos || []).length || 'nenhum') + ' membro(s) fora da moderação automática.'
    return reply(doc)
    }
}
