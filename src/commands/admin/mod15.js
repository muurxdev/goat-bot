/**
 * Comando .modregistrar — REGISTRAR OCORRÊNCIA
 *
 * Anota uma ocorrência no livro sem punir.
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
    name: 'modregistrar',
    aliases: ["anotarocorrencia","cmd_modregistrar","alt_modregistrar","atalho_modregistrar","abrev_modregistrar","call_modregistrar","func_modregistrar"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Anota uma ocorrência no livro sem punir',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só Cavaleiros com cargo de administração registram ocorrências.')
    const alvo = alvoDe({ mentionedJid, quotedSender, args })
    if (!alvo) return reply(pedeAlvo(prefix, 'modregistrar'))
    const motivo = args.filter(a => !/^@/.test(a) && !/^\d{8,}$/.test(a)).join(' ').trim() || 'não informado'
    M.registrar(from, { alvo, autor: sender, acao: 'anotação', motivo })
    let doc = cab('OCORRÊNCIA REGISTRADA', '✍️')
    doc += linha('Membro', M.nomeCurto(alvo))
    doc += linha('Motivo', motivo)
    doc += linha('Registrado por', M.nomeCurto(sender))
    doc += '\n_Anotação não pune ninguém — serve para o histórico._'
    return reply(doc, [alvo])
    }
}
