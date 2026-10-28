/**
 * Comando .modsemana — OCORRÊNCIAS DA SEMANA
 *
 * O que a guarda registrou nos últimos 7 dias.
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
    name: 'modsemana',
    aliases: ["ocorrenciassemana","cmd_modsemana","alt_modsemana","atalho_modsemana","abrev_modsemana","call_modsemana","func_modsemana"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'O que a guarda registrou nos últimos 7 dias',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const corte = Date.now() - 7 * 86400000
    const l = M.livro(from).filter(o => (Number(o.em) || 0) >= corte)
    let doc = cab('OCORRÊNCIAS DA SEMANA', '📆')
    if (!l.length) return reply(F.tela({
        emoji: '📆', titulo: 'Ocorrências da semana', prefix,
        intro: '🟢 Semana sem ocorrências. Quando houver, eu mostro quantas foram em cada dia dos últimos 7.',
        proximos: [
            { nome: 'modrelatorio', args: '30', oque: 'relatório do mês' },
            { nome: 'modhoje', oque: 'só as últimas 24 horas' }
        ]
    }))
    const porDia = new Map()
    for (const o of l) {
        const dia = new Date(Number(o.em)).toLocaleDateString('pt-BR')
        porDia.set(dia, (porDia.get(dia) || 0) + 1)
    }
    doc += linha('Total', String(l.length)) + '\n'
    for (const [dia, n] of porDia) doc += '┃ ' + dia + ' — ' + '█'.repeat(Math.min(12, n)) + ' ' + n + '\n'
    return reply(doc)
    }
}
