/**
 * Comando .modtendencia — TENDÊNCIA DA GUARDA
 *
 * Se o grupo está piorando ou melhorando.
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
    name: 'modtendencia',
    aliases: ["tendenciamoderacao","cmd_modtendencia","alt_modtendencia","atalho_modtendencia","abrev_modtendencia","call_modtendencia","func_modtendencia"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Se o grupo está piorando ou melhorando',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const a7 = M.porAcao(from, 7).reduce((a, b) => a + b.total, 0)
    const a30 = M.porAcao(from, 30).reduce((a, b) => a + b.total, 0)
    let doc = cab('TENDÊNCIA DA GUARDA', '📉')
    if (!a30) return reply(F.tela({
        emoji: '📉', titulo: 'Tendência da guarda', prefix,
        intro: '🟢 Nenhuma ocorrência em 30 dias, grupo tranquilo. Com registros, eu comparo a última semana com a média do mês e digo se está piorando ou melhorando.',
        proximos: [
            { nome: 'modsemana', oque: 'ocorrências dos últimos 7 dias' },
            { nome: 'modrelatorio', oque: 'relatório do mês' }
        ]
    }))
    const mediaSemanal = a30 / 30 * 7
    const variacao = mediaSemanal ? ((a7 - mediaSemanal) / mediaSemanal) * 100 : 0
    doc += linha('Últimos 7 dias', String(a7))
    doc += linha('Média por semana', mediaSemanal.toFixed(1))
    doc += linha('Variação', (variacao >= 0 ? '🔺 +' : '🔻 ') + variacao.toFixed(0) + '%')
    doc += '\n_' + (variacao > 30 ? 'O grupo está piorando.' : variacao < -30 ? 'O grupo está melhorando.' : 'Situação estável.') + '_'
    return reply(doc)
    }
}
