/**
 * Comando .socialdecaimento — COMO A AFINIDADE FUNCIONA
 *
 * Explica o cálculo do vínculo entre membros.
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
    name: 'socialdecaimento',
    aliases: ["comofuncionaafinidade"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Explica o cálculo do vínculo entre membros',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os gestos sociais só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, mentionedJid, quotedSender }
    let doc = cab('COMO A AFINIDADE FUNCIONA', '🧭')
    doc += '⭐ *Peso do gesto* — cuidar e proteger valem mais que provocar. Veja `' + prefix + 'socialpeso`.\n\n'
    doc += '⏳ *Tempo* — gesto antigo vale menos. A cada *' + S.MEIA_VIDA_DIAS + ' dias* o valor cai pela metade.\n\n'
    doc += '🔄 *Reciprocidade* — vínculo de mão dupla pontua mais. Marcar alguém cem vezes sem resposta não cria amizade.\n\n'
    doc += '📊 *Nota* — vai de 0 a 100 e muda sozinha com o tempo. Consulte com `' + prefix + 'afinidade @alguem`.'
    return reply(doc)
    }
}
