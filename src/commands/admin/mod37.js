/**
 * Comando .modhoje — OCORRÊNCIAS DE HOJE
 *
 * O que a guarda registrou nas últimas 24 horas.
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
    name: 'modhoje',
    aliases: ["ocorrenciashoje","cmd_modhoje","alt_modhoje","atalho_modhoje","abrev_modhoje","call_modhoje","func_modhoje"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'O que a guarda registrou nas últimas 24 horas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from).filter(o => Date.now() - (Number(o.em) || 0) < 86400000)
    let doc = cab('OCORRÊNCIAS DE HOJE', '☀️')
    if (!l.length) return reply(F.tela({
        emoji: '☀️', titulo: 'Ocorrências de hoje', prefix,
        intro: '🟢 Dia tranquilo: nenhuma ocorrência nas últimas 24 horas. Quando houver, cada uma aparece aqui com horário, membro e ação.',
        proximos: [
            { nome: 'modsemana', oque: 'vê os últimos 7 dias' },
            { nome: 'modresumo', oque: 'resumo geral da moderação' }
        ]
    }))
    doc += linha('Total', String(l.length)) + '\n'
    for (const o of l.slice(0, 15)) doc += '┃ ' + quando(o.em).slice(11, 16) + ' · ' + M.nomeCurto(o.alvo) + ' · ' + o.acao + '\n'
    return reply(doc)
    }
}
