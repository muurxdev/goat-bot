/**
 * Comando .modlimparlivro — LIMPAR O LIVRO
 *
 * Apaga o histórico de ocorrências do grupo.
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
    name: 'modlimparlivro',
    aliases: ["zerarlivro","cmd_modlimparlivro","alt_modlimparlivro","atalho_modlimparlivro","abrev_modlimparlivro","call_modlimparlivro","func_modlimparlivro"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Apaga o histórico de ocorrências do grupo',
    usage: '[confirmar]',
    examples: [' — mostra quantas ocorrências serão apagadas', 'confirmar — apaga o histórico de vez'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    if (!isAdmin) return reply('🛡️ Só a administração limpa o livro.')
    const l = M.livro(from)
    if (!l.length) return reply(F.tela({
        emoji: '🧹', titulo: 'Limpar o livro', prefix,
        intro: 'O livro de ocorrências deste grupo já está vazio, não há nada para apagar.',
        dica: 'Quando houver registros, peço confirmação antes de apagar, porque não tem volta.',
        proximos: [{ nome: 'modlivrototal', oque: 'vê quanto do livro está ocupado' }]
    }))
    if (String(args[0] || '').toLowerCase() !== 'confirmar') {
        return reply('🧹 *Limpar o livro apaga ' + l.length + ' ocorrências e não tem volta.*\n\nPara confirmar: `' + prefix + 'modlimparlivro confirmar`')
    }
    require('../../services/profileDataService').deleteData(from, 'moderacao_ocorrencias')
    return reply('🧹 Livro apagado. ' + l.length + ' ocorrências removidas.')
    }
}
