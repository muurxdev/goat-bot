/**
 * Comando .modultimas — ÚLTIMAS AÇÕES
 *
 * As ocorrências mais recentes do grupo.
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
    name: 'modultimas',
    aliases: ["ultimasacoes","cmd_modultimas","alt_modultimas","atalho_modultimas","abrev_modultimas","call_modultimas","func_modultimas"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'As ocorrências mais recentes do grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from).slice(0, 15)
    let doc = cab('ÚLTIMAS AÇÕES', '🕐')
    if (!l.length) return reply(F.tela({
        emoji: '🕐', titulo: 'Últimas ações', prefix,
        intro: 'Nenhuma ocorrência registrada neste grupo. Quando houver, aparecem as 15 mais recentes com data, membro, ação e motivo.',
        proximos: [
            { nome: 'modregistrar', args: '@pessoa motivo', oque: 'anota uma ocorrência sem punir' },
            { nome: 'modbuscar', args: 'spam', oque: 'procura por motivo ou ação' }
        ]
    }))
    for (const o of l) {
        doc += '┃ ' + quando(o.em).slice(0, 16) + '\n┃   ' + M.nomeCurto(o.alvo) + ' · ' + o.acao + (o.motivo ? ' (' + o.motivo + ')' : '') + '\n'
    }
    return reply(doc)
    }
}
