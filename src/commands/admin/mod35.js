/**
 * Comando .modprimeira — PRIMEIRA OCORRÊNCIA
 *
 * A ocorrência mais antiga guardada do membro.
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
    name: 'modprimeira',
    aliases: ["primeiraocorrencia","cmd_modprimeira","alt_modprimeira","atalho_modprimeira","abrev_modprimeira","call_modprimeira","func_modprimeira"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'A ocorrência mais antiga guardada do membro',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const alvo = alvoDe({ mentionedJid, quotedSender, args })
    if (!alvo) return reply(pedeAlvo(prefix, 'modprimeira'))
    const h = M.historicoDe(from, alvo)
    let doc = cab('PRIMEIRA OCORRÊNCIA', '🥇')
    doc += linha('Membro', M.nomeCurto(alvo))
    if (!h.length) return reply(doc + '\n🟢 _Nenhuma ocorrência registrada._', [alvo])
    const primeira = h[h.length - 1]
    doc += linha('Quando', quando(primeira.em))
    doc += linha('Ação', primeira.acao)
    doc += linha('Motivo', primeira.motivo || 'não informado')
    doc += linha('Total desde então', String(h.length))
    return reply(doc, [alvo])
    }
}
