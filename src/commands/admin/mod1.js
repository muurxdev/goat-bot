/**
 * Comando .modficha — FICHA DO MEMBRO
 *
 * Situação completa de um membro na moderação.
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
    name: 'modficha',
    aliases: ["fichamembro","cmd_modficha","alt_modficha","atalho_modficha","abrev_modficha","call_modficha","func_modficha"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Situação completa de um membro na moderação',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const alvo = alvoDe({ mentionedJid, quotedSender, args })
    if (!alvo) return reply(pedeAlvo(prefix, 'modficha'))
    const f = M.ficha(from, alvo)
    const esc = M.escaladaSugerida(from, f.advertencias)
    let doc = cab('FICHA DO MEMBRO', '🗂️')
    doc += linha('Membro', M.nomeCurto(alvo))
    doc += linha('Advertências', String(f.advertencias))
    doc += linha('Ocorrências no livro', String(f.ocorrencias))
    doc += linha('Silenciado', f.silenciado ? '🔇 Sim, até ' + quando(f.silenciadoAte) : '🔊 Não')
    doc += linha('Lista negra', f.listaNegra ? '🚫 Sim' : 'Não')
    doc += linha('Confiável', f.confiavel ? '🤝 Sim' : 'Não')
    if (f.cargo) doc += linha('Cargo', f.cargo)
    doc += sep()
    doc += linha('Situação', esc.texto)
    if (f.ultimaOcorrencia) doc += linha('Última ação', f.ultimaOcorrencia.acao + ' em ' + quando(f.ultimaOcorrencia.em))
    return reply(doc, [alvo])
    }
}
