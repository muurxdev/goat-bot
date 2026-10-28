/**
 * Comando .modreincidentes — REINCIDENTES
 *
 * Quem mais acumula ocorrências no grupo.
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
    name: 'modreincidentes',
    aliases: ["maisproblematicos","cmd_modreincidentes","alt_modreincidentes","atalho_modreincidentes","abrev_modreincidentes","call_modreincidentes","func_modreincidentes"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Quem mais acumula ocorrências no grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const r = M.reincidentes(from, 10)
    let doc = cab('REINCIDENTES', '🔁')
    if (!r.length) return reply(F.tela({
        emoji: '🔁', titulo: 'Reincidentes', prefix,
        intro: '🟢 Nenhuma ocorrência registrada neste grupo. Quando houver, aqui aparecem as 10 pessoas que mais acumulam registros e quais ações receberam.',
        proximos: [
            { nome: 'modficha', args: '@pessoa', oque: 'situação completa de um membro' },
            { nome: 'modrisco', oque: 'quem está perto do limite de advertências' }
        ]
    }))
    const mencoes = []
    r.forEach((x, i) => {
        mencoes.push(x.alvo)
        doc += '┃ ' + (i + 1) + '. ' + M.nomeCurto(x.alvo) + ' — ' + x.total + 'x (' + x.acoes.join(', ') + ')\n'
    })
    return reply(doc, mencoes)
    }
}
