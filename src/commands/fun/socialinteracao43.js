/**
 * Comando .socialajuda — GUIA SOCIAL
 *
 * Todos os comandos de vínculo social.
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
    name: 'socialajuda',
    aliases: ["guiasocial"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Todos os comandos de vínculo social',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, mentionedJid, quotedSender }
    let doc = cab('GUIA SOCIAL', '🗺️')
    doc += bloco('🎭 GESTOS', ['Veja os ' + Object.keys(S.GESTOS).length + ' gestos em `' + prefix + 'socialcatalogo`'])
    doc += '\n' + bloco('💞 VÍNCULOS', [
        '`' + prefix + 'afinidade @alguem` · `' + prefix + 'socialhistorico`',
        '`' + prefix + 'socialreciprocidade` · `' + prefix + 'socialconexoes`'
    ])
    doc += '\n' + bloco('📊 GRUPO', [
        '`' + prefix + 'socialduplas` · `' + prefix + 'socialtop`',
        '`' + prefix + 'socialqueridos` · `' + prefix + 'socialsolitarios`',
        '`' + prefix + 'socialgestos` · `' + prefix + 'socialresumo`'
    ])
    return reply(doc)
    }
}
