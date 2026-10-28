/**
 * Comando .modautores — QUEM MAIS MODERA
 *
 * Ranking dos administradores que mais agem.
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
    name: 'modautores',
    aliases: ["quemmodera","cmd_modautores","alt_modautores","atalho_modautores","abrev_modautores","call_modautores","func_modautores"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Ranking dos administradores que mais agem',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const mapa = new Map()
    for (const o of M.livro(from)) {
        if (!o.autor) continue
        mapa.set(o.autor, (mapa.get(o.autor) || 0) + 1)
    }
    const lista = [...mapa].map(([autor, total]) => ({ autor, total })).sort((a, b) => b.total - a.total)
    let doc = cab('QUEM MAIS MODERA', '👮')
    if (!lista.length) return reply(F.tela({
        emoji: '👮', titulo: 'Quem mais modera', prefix,
        intro: 'Ainda não há ações com o nome de quem aplicou. Esta tela mostra quais administradores mais advertem, silenciam ou registram ocorrências.',
        dica: 'Punições automáticas não têm autor, então não contam neste ranking.',
        proximos: [
            { nome: 'warn', args: '@pessoa motivo', oque: 'adverte um membro' },
            { nome: 'modregistrar', args: '@pessoa motivo', oque: 'anota uma ocorrência sem punir' }
        ]
    }))
    const mencoes = []
    lista.slice(0, 10).forEach((x, i) => { mencoes.push(x.autor); doc += '┃ ' + (i + 1) + '. ' + M.nomeCurto(x.autor) + ' — ' + x.total + ' ações\n' })
    return reply(doc, mencoes)
    }
}
