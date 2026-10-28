/**
 * Comando .modtopadvertidos — MAIS ADVERTIDOS
 *
 * Ranking de advertências acumuladas. A tabela warns não separa por grupo,
 * então o ranking soma todos os grupos em que o bot está (e a tela diz isso).
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
    name: 'modtopadvertidos',
    aliases: ["maisadvertidos","cmd_modtopadvertidos","alt_modtopadvertidos","atalho_modtopadvertidos","abrev_modtopadvertidos","call_modtopadvertidos","func_modtopadvertidos"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Ranking de advertências acumuladas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const t = M.topAdvertidos(10)
    let doc = cab('MAIS ADVERTIDOS', '⚠️')
    doc += '_Advertências somadas de todos os grupos em que estou._\n\n'
    if (!t.length) return reply(F.tela({
        emoji: '⚠️', titulo: 'Mais advertidos', prefix,
        intro: '🟢 Ninguém tem advertências em nenhum dos grupos em que estou. Quando houver, aparecem as 10 pessoas com mais advertências, somando todos esses grupos.',
        proximos: [
            { nome: 'warn', args: '@pessoa motivo', oque: 'adverte um membro' },
            { nome: 'modrisco', oque: 'quem está perto do limite' }
        ]
    }))
    const mencoes = []
    t.forEach((x, i) => { mencoes.push(x.jid); doc += '┃ ' + (i + 1) + '. ' + M.nomeCurto(x.jid) + ' — ' + x.count + ' advertências\n' })
    return reply(doc, mencoes)
    }
}
