/**
 * Comando .modsituacao — SITUAÇÃO DO GRUPO
 *
 * Termômetro geral da ordem no grupo.
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
    name: 'modsituacao',
    aliases: ["situacaogrupo","cmd_modsituacao","alt_modsituacao","atalho_modsituacao","abrev_modsituacao","call_modsituacao","func_modsituacao"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Termômetro geral da ordem no grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from)
    const s = M.silenciadosAtivos(from)
    const a7 = M.porAcao(from, 7).reduce((a, b) => a + b.total, 0)
    let nota = 100
    nota -= a7 * 8
    nota -= s.length * 10
    nota = Math.max(0, Math.min(100, nota))
    let doc = cab('SITUAÇÃO DO GRUPO', '🌡️')
    doc += linha('Ordem', nota + '/100')
    doc += '\n' + barra(nota / 100) + '\n'
    doc += linha('Ocorrências (7d)', String(a7))
    doc += linha('Silenciados', String(s.length))
    doc += linha('Livro', String(l.length) + ' registros')
    doc += '\n_' + (nota >= 80 ? '🟢 Grupo em ordem.' : nota >= 50 ? '🟡 Merece atenção.' : '🔴 Situação tensa.') + '_'
    return reply(doc)
    }
}
