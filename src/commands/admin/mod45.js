/**
 * Comando .modcontagem — CONTAGEM RÁPIDA
 *
 * Números do livro sem detalhamento.
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
    name: 'modcontagem',
    aliases: ["contarocorrencias","cmd_modcontagem","alt_modcontagem","atalho_modcontagem","abrev_modcontagem","call_modcontagem","func_modcontagem"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Números do livro sem detalhamento',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const l = M.livro(from)
    const alvos = new Set(l.map(o => o.alvo).filter(Boolean))
    const autores = new Set(l.map(o => o.autor).filter(Boolean))
    let doc = cab('CONTAGEM RÁPIDA', '🔢')
    doc += linha('Ocorrências', String(l.length))
    doc += linha('Membros envolvidos', String(alvos.size))
    doc += linha('Administradores atuantes', String(autores.size))
    doc += linha('Silenciados agora', String(M.silenciadosAtivos(from).length))
    if (!l.length) {
        return reply(F.tela({
            emoji: '🔢', titulo: 'Contagem rápida', prefix,
            intro: 'O livro de ocorrências deste grupo está vazio: nenhum registro, ninguém envolvido.',
            secoes: [{ emoji: '📋', titulo: 'Números', linhas: [
                F.campo('Ocorrências', '0'),
                F.campo('Silenciados agora', String(M.silenciadosAtivos(from).length))
            ] }],
            dica: 'Cada advertência, silêncio ou anotação vira uma ocorrência no livro.',
            proximos: [
                { nome: 'modresumo', oque: 'resumo do que aconteceu' },
                { nome: 'modajuda', oque: 'todos os comandos de moderação' }
            ]
        }))
    }
    return reply(doc)
    }
}
