/**
 * Comando .modconfig — CONFIGURAÇÃO DA GUARDA
 *
 * Como a moderação está ajustada neste grupo.
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
    name: 'modconfig',
    aliases: ["configmoderacao","cmd_modconfig","alt_modconfig","atalho_modconfig","abrev_modconfig","call_modconfig","func_modconfig"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Como a moderação está ajustada neste grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const c = M.config(from)
    let doc = cab('CONFIGURAÇÃO DA GUARDA', '⚙️')
    doc += linha('Limite de advertências', String(c.limiteAdvertencias))
    doc += linha('Punição no limite', c.punicaoNoLimite)
    doc += linha('Tempo de silêncio', c.tempoSilencioMin + ' minutos')
    doc += linha('Membros isentos', String((c.isentos || []).length))
    doc += '\n' + bloco('🔧 AJUSTAR', [
        '`' + prefix + 'modlimite 5` — muda o limite',
        '`' + prefix + 'modpunicao silenciar` — muda a punição',
        '`' + prefix + 'modtempopadrao 120` — muda o tempo'
    ])
    return reply(doc)
    }
}
