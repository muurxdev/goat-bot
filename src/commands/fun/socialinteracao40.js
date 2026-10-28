/**
 * Comando .socialhistorico — HISTÓRICO DO VÍNCULO
 *
 * Quais gestos você já trocou com alguém.
 */

const S = require('../../services/socialService')

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

/** Resolve o alvo do gesto: menção ou resposta. */
function alvoDe(ctx) {
    const marcado = (ctx.mentionedJid || [])[0]
    if (marcado) return marcado
    if (ctx.quotedSender) return ctx.quotedSender
    return null
}
/** Executa um gesto: valida, registra e devolve a frase. */
function gesto(ctx, chave) {
    const info = S.GESTOS[chave]
    const alvo = alvoDe(ctx)
    const eu = '@' + String(ctx.sender).split('@')[0]
    if (!alvo) {
        return ctx.reply(info.emoji + ' ' + eu + ' ' + info.solo + '.\n\n_Marque alguém para direcionar o gesto._', [ctx.sender])
    }
    if (String(alvo).split('@')[0] === String(ctx.sender).split('@')[0]) {
        return ctx.reply(info.emoji + ' ' + eu + ', não dá para fazer isso consigo mesmo.', [ctx.sender])
    }
    const par = S.registrar(ctx.from, ctx.sender, alvo, chave)
    const af = S.afinidade(ctx.from, ctx.sender, alvo)
    let doc = info.emoji + ' ' + eu + ' ' + info.frase + ' @' + String(alvo).split('@')[0] + '!\n\n'
    doc += '💫 _' + S.nivelDe(af.nota) + ' · afinidade ' + af.nota + '/100 · ' + (par ? par.total : 1) + ' gestos entre vocês._'
    return ctx.reply(doc, [ctx.sender, alvo])
}

module.exports = {
    name: 'socialhistorico',
    aliases: ["historicovinculo"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Quais gestos você já trocou com alguém',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, mentionedJid, quotedSender }
    const alvo = alvoDe(ctx)
    if (!alvo) return reply('📜 Marque alguém.\n\n📌 Exemplo: `' + prefix + 'socialhistorico @fulano`')
    const af = S.afinidade(from, sender, alvo)
    let doc = cab('HISTÓRICO DO VÍNCULO', '📜')
    if (!af.total) return reply(doc + '_Vocês nunca trocaram gestos._', [alvo])
    doc += linha('Total', String(af.total))
    doc += linha('Último gesto', new Date(af.ultima).toLocaleString('pt-BR'))
    doc += '\n' + bloco('🎭 GESTOS', Object.entries(af.gestos).sort((a, b) => b[1] - a[1])
        .map(([g, n]) => (S.GESTOS[g]?.emoji || '•') + ' ' + g + ' — ' + n + 'x'))
    return reply(doc, [sender, alvo])
    }
}
