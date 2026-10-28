/**
 * Comando .modisentos — MEMBROS ISENTOS
 *
 * Quem está fora da moderação automática.
 */

const M = require('../../services/moderationService')
const F = require('../../utils/formato')

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
    name: 'modisentos',
    aliases: ["listaisentos","cmd_modisentos","alt_modisentos","atalho_modisentos","abrev_modisentos","call_modisentos","func_modisentos"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Quem está fora da moderação automática',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const c = M.config(from)
    let doc = cab('MEMBROS ISENTOS', '📃')
    if (!(c.isentos || []).length) return reply(F.tela({
        emoji: '📃', titulo: 'Membros isentos', prefix,
        intro: 'Ninguém está isento: a moderação automática vale para todos os membros deste grupo.',
        dica: 'Isente só quem precisa mandar links ou mensagens repetidas por trabalho, como um parceiro.',
        proximos: [
            { nome: 'modisentar', args: '@pessoa', oque: 'deixa alguém fora da moderação automática' },
            { nome: 'moddesisentar', args: '@pessoa', oque: 'tira a isenção' }
        ]
    }))
    const mencoes = []
    for (const j of c.isentos) { mencoes.push(j); doc += '┃ ' + M.nomeCurto(j) + '\n' }
    return reply(doc, mencoes)
    }
}
