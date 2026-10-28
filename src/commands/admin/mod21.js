/**
 * Comando .modpunicao — PUNIÇÃO NO LIMITE
 *
 * Define o que acontece ao atingir o limite.
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
    name: 'modpunicao',
    aliases: ["punicaolimite","cmd_modpunicao","alt_modpunicao","atalho_modpunicao","abrev_modpunicao","call_modpunicao","func_modpunicao"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Define o que acontece ao atingir o limite',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só a administração muda a configuração da guarda.')
    const opcoes = ['silenciar', 'expulsar', 'banir', 'avisar']
    const escolha = String(args[0] || '').toLowerCase()
    if (!opcoes.includes(escolha)) {
        return reply('⚖️ *Punição no limite*\n\nEscolha uma:\n' + opcoes.map(o => '┃ `' + prefix + 'modpunicao ' + o + '`').join('\n'))
    }
    M.salvarConfig(from, { punicaoNoLimite: escolha })
    return reply('⚖️ Ao atingir o limite, a guarda vai *' + escolha + '*.')
    }
}
