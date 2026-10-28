/**
 * Comando .modrisco — MEMBROS EM RISCO
 *
 * Quem está perto do limite de advertências. A contagem vem da tabela warns,
 * que não separa por grupo: soma todos os grupos em que o bot está.
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
    name: 'modrisco',
    aliases: ["emrisco","cmd_modrisco","alt_modrisco","atalho_modrisco","abrev_modrisco","call_modrisco","func_modrisco"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Quem está perto do limite de advertências',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const c = M.config(from)
    const t = M.topAdvertidos(30).filter(x => x.count >= c.limiteAdvertencias - 1)
    let doc = cab('MEMBROS EM RISCO', '🚨')
    doc += linha('Limite do grupo', String(c.limiteAdvertencias) + ' advertências')
    doc += '_Advertências somadas de todos os grupos em que estou._\n'
    if (!t.length) return reply(F.tela({
        emoji: '🚨', titulo: 'Membros em risco', prefix,
        intro: '🟢 Ninguém está perto do limite. Aqui aparece quem está a uma advertência (ou menos) da punição, somando as advertências de todos os grupos em que estou.',
        secoes: [{ emoji: '⚖️', titulo: 'Regra do grupo', linhas: [F.campo('Limite', c.limiteAdvertencias + ' advertências')] }],
        proximos: [
            { nome: 'modlimite', args: '3', oque: 'muda o limite de advertências' },
            { nome: 'modtopadvertidos', oque: 'ranking de advertências' }
        ]
    }))
    doc += '\n'
    const mencoes = []
    for (const x of t) {
        mencoes.push(x.jid)
        const falta = c.limiteAdvertencias - x.count
        doc += '┃ ' + M.nomeCurto(x.jid) + ' — ' + x.count + '/' + c.limiteAdvertencias + (falta > 0 ? ' (falta ' + falta + ')' : ' ⛔ no limite') + '\n'
    }
    return reply(doc, mencoes)
    }
}
