/**
 * Comando .modexportar — EXPORTAR O LIVRO
 *
 * Livro de ocorrências em texto para copiar.
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
    name: 'modexportar',
    aliases: ["exportarlivro","cmd_modexportar","alt_modexportar","atalho_modexportar","abrev_modexportar","call_modexportar","func_modexportar"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Livro de ocorrências em texto para copiar',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só a administração exporta o livro.')
    const l = M.livro(from).slice(0, 40)
    if (!l.length) return reply(F.tela({
        emoji: '📤', titulo: 'Exportar o livro', prefix,
        intro: 'O livro de ocorrências deste grupo está vazio, então não há nada para exportar. Quando houver registros, eu mando as 40 mais recentes em texto pronto para copiar.',
        dica: 'Cada linha sai com data, número do membro, ação e motivo.',
        proximos: [
            { nome: 'modregistrar', args: '@pessoa motivo', oque: 'anota uma ocorrência' },
            { nome: 'modultimas', oque: 'vê as ocorrências mais recentes' }
        ]
    }))
    let doc = cab('EXPORTAR O LIVRO', '📤')
    doc += '```\n'
    for (const o of l) doc += quando(o.em).slice(0, 16) + ' | ' + String(o.alvo).split('@')[0] + ' | ' + o.acao + ' | ' + (o.motivo || '-') + '\n'
    doc += '```'
    return reply(doc)
    }
}
