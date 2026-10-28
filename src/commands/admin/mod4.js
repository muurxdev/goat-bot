/**
 * Comando .modacoes — AÇÕES DE MODERAÇÃO
 *
 * Quantas ações de cada tipo nos últimos 30 dias.
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
    name: 'modacoes',
    aliases: ["acoesmoderacao","cmd_modacoes","alt_modacoes","atalho_modacoes","abrev_modacoes","call_modacoes","func_modacoes"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Quantas ações de cada tipo nos últimos 30 dias',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const a = M.porAcao(from, 30)
    let doc = cab('AÇÕES DE MODERAÇÃO', '📊')
    if (!a.length) return reply(F.tela({
        emoji: '📊', titulo: 'Ações de moderação', prefix,
        intro: 'Nenhuma ação foi registrada neste grupo nos últimos 30 dias. Quando alguém for advertido, silenciado ou removido, a contagem de cada tipo aparece aqui.',
        dica: 'Anotações feitas à mão também entram nesta conta, mesmo sem punir ninguém.',
        proximos: [
            { nome: 'modregistrar', args: '@pessoa motivo', oque: 'anota uma ocorrência sem punir' },
            { nome: 'modconfig', oque: 'vê como a moderação está ajustada' }
        ]
    }))
    const maior = a[0].total || 1
    for (const x of a) doc += '┃ ' + String(x.acao).padEnd(16) + '█'.repeat(Math.max(1, Math.round(x.total / maior * 12))) + ' ' + x.total + '\n'
    return reply(doc)
    }
}
