/**
 * Comando .modglossario — GLOSSÁRIO DA GUARDA
 *
 * O que cada termo da moderação significa.
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
    name: 'modglossario',
    aliases: ["termosguarda","cmd_modglossario","alt_modglossario","atalho_modglossario","abrev_modglossario","call_modglossario","func_modglossario"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'O que cada termo da moderação significa',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    let doc = cab('GLOSSÁRIO DA GUARDA', '📚')
    const termos = [
        ['Advertência', 'aviso que fica contado na ficha'],
        ['Ocorrência', 'qualquer registro no livro, punindo ou não'],
        ['Silenciamento', 'impede a pessoa de falar por um tempo'],
        ['Escalada', 'sequência de punições conforme reincide'],
        ['Isenção', 'membro fora da moderação automática'],
        ['Lista negra', 'a pessoa fica proibida de usar meus comandos'],
        ['Ficha limpa', 'nenhum registro de punição']
    ]
    for (const [t, d] of termos) doc += '┃ *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
