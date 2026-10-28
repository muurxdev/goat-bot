/**
 * Comando .modtempopadrao — TEMPO PADRÃO DE SILÊNCIO
 *
 * Minutos de silêncio aplicados por padrão.
 */

const M = require('../../services/moderationService')

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
    name: 'modtempopadrao',
    aliases: ["tempossilencio","cmd_modtempopadrao","alt_modtempopadrao","atalho_modtempopadrao","abrev_modtempopadrao","call_modtempopadrao","func_modtempopadrao"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Minutos de silêncio aplicados por padrão',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só a administração muda a configuração da guarda.')
    const n = parseInt(args[0], 10)
    if (!n || n < 1 || n > 10080) return reply('⏲️ Informe minutos entre 1 e 10080 (7 dias).\n\n📌 Exemplo: `' + prefix + 'modtempopadrao 60`')
    M.salvarConfig(from, { tempoSilencioMin: n })
    return reply('⏲️ *Tempo padrão de silêncio:* ' + n + ' minutos (' + M.duracao(n * 60000) + ').')
    }
}
