/**
 * Comando .modlivrototal — TAMANHO DO LIVRO
 *
 * Quanto do livro de ocorrências está ocupado.
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
    name: 'modlivrototal',
    aliases: ["tamanholivro","cmd_modlivrototal","alt_modlivrototal","atalho_modlivrototal","abrev_modlivrototal","call_modlivrototal","func_modlivrototal"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Quanto do livro de ocorrências está ocupado',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from)
    const pct = (l.length / M.TETO_OCORRENCIAS) * 100
    return reply(F.tela({
        emoji: '📚', titulo: 'Tamanho do livro', prefix,
        intro: l.length
            ? 'O livro guarda até ' + M.TETO_OCORRENCIAS + ' ocorrências por grupo. Quando enche, as mais antigas saem para dar lugar às novas.'
            : 'O livro deste grupo está vazio. Ele guarda até ' + M.TETO_OCORRENCIAS + ' ocorrências; quando enche, as mais antigas saem.',
        secoes: [{ emoji: '📋', titulo: 'Ocupação', linhas: [
            F.campo('Ocorrências guardadas', l.length + ' de ' + M.TETO_OCORRENCIAS),
            F.barra(pct / 100)
        ] }],
        dica: pct > 80 ? 'Perto do limite: exporte o livro agora se quiser guardar os registros antigos.' : '',
        proximos: [
            pct > 80 ? { nome: 'modexportar', oque: 'copia o livro em texto' } : { nome: 'modresumo', oque: 'resumo da moderação' },
            { nome: 'modlimparlivro', oque: 'apaga o histórico do grupo' }
        ]
    }))
    }
}
