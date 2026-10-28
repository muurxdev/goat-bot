/**
 * Comando .modresumo — RESUMO DA GUARDA
 *
 * O que aconteceu recentemente na moderação.
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
    name: 'modresumo',
    aliases: ["resumomoderacao","cmd_modresumo","alt_modresumo","atalho_modresumo","abrev_modresumo","call_modresumo","func_modresumo"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'O que aconteceu recentemente na moderação',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from)
    let doc = cab('RESUMO DA GUARDA', '📋')
    if (!l.length) return reply(F.tela({
        emoji: '📋', titulo: 'Resumo da guarda', prefix,
        intro: '🟢 Nada registrado ainda, grupo tranquilo. Quando houver ocorrências, o resumo mostra quantas foram hoje, o total e as últimas.',
        proximos: [
            { nome: 'modconfig', oque: 'como a moderação está ajustada' },
            { nome: 'modajuda', oque: 'todos os comandos de moderação' }
        ]
    }))
    const hoje = l.filter(o => Date.now() - (Number(o.em) || 0) < 86400000)
    doc += linha('Hoje', String(hoje.length) + ' ocorrências')
    doc += linha('Total no livro', String(l.length))
    doc += '\n' + bloco('🕐 ÚLTIMAS', l.slice(0, 6).map(o =>
        quando(o.em).slice(0, 16) + ' · ' + M.nomeCurto(o.alvo) + ' · ' + o.acao))
    return reply(doc)
    }
}
