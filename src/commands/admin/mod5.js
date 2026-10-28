/**
 * Comando .modmotivosgrupo — MOTIVOS MAIS FREQUENTES
 *
 * Por que as pessoas são punidas neste grupo.
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
    name: 'modmotivosgrupo',
    aliases: ["motivosfrequentes","cmd_modmotivosgrupo","alt_modmotivosgrupo","atalho_modmotivosgrupo","abrev_modmotivosgrupo","call_modmotivosgrupo","func_modmotivosgrupo"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Por que as pessoas são punidas neste grupo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const m = M.porMotivo(from, 30)
    let doc = cab('MOTIVOS MAIS FREQUENTES', '🏷️')
    if (!m.length) return reply(F.tela({
        emoji: '🏷️', titulo: 'Motivos mais frequentes', prefix,
        intro: 'Nenhum motivo registrado nos últimos 30 dias. Esta tela mostra por que as pessoas mais são punidas aqui, para ajustar as regras.',
        dica: 'Escreva o motivo ao punir: sem ele, a ocorrência entra como "não informado".',
        proximos: [
            { nome: 'modmotivos', oque: 'lista de motivos prontos' },
            { nome: 'warn', args: '@pessoa Spam', oque: 'adverte com motivo' }
        ]
    }))
    const maior = m[0].total || 1
    for (const x of m) doc += '┃ ' + String(x.motivo).slice(0, 16).padEnd(17) + '█'.repeat(Math.max(1, Math.round(x.total / maior * 10))) + ' ' + x.total + '\n'
    return reply(doc)
    }
}
