/**
 * Comando .transpor — TRANSPOR CIFRA
 *
 * Sobe ou desce a cifra em semitons, preservando sufixo e baixo.
 */

const M = require('../../services/musicService')

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


module.exports = {
    name: 'transpor',
    aliases: ["transporcifra","mudartom"],
    category: 'general',
    subcategory: 'Música',
    description: 'Sobe ou desce a cifra em semitons, preservando sufixo e baixo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const passo = parseInt(args[args.length - 1], 10)
    const acordes = args.slice(0, -1)
    if (!Number.isFinite(passo) || !acordes.length) {
        let doc = cab('TRANSPOR CIFRA', '🎚️')
        doc += '📌 Uso: `' + prefix + 'transpor <acordes> <semitons>`\n\n'
        doc += '🧮 *Exemplos*\n'
        doc += '`' + prefix + 'transpor C Am F G7 2` — sobe um tom\n'
        doc += '`' + prefix + 'transpor G D Em C -2` — desce um tom\n\n'
        doc += '_Sufixos (m, 7, maj7, sus4) e baixo invertido (C/E) são preservados._\n'
        doc += '🎸 _Capotraste: subir 2 semitons = casa 2._'
        return reply(doc)
    }
    const r = M.transpor(acordes.join(' '), passo)
    if (!r) return reply('🎚️ Não consegui ler esses acordes.')
    let doc = cab('TRANSPOR CIFRA', '🎚️')
    doc += linha('Movimento', (passo > 0 ? '+' : '') + passo + ' semitom(ns)' + (Math.abs(passo) === 2 ? ' (um tom)' : ''))
    doc += sep()
    doc += '🔵 *Original*\n' + r.original.join('  ') + '\n\n'
    doc += '🟢 *Transposta*\n' + r.transposta.join('  ') + '\n\n'
    if (passo > 0) doc += '🎸 _No violão, o mesmo efeito sai com capotraste na casa ' + passo + ' tocando a cifra original._\n'
    doc += '🎓 _Entender o campo harmônico do novo tom:_ `' + prefix + 'campoharmonico ' + r.transposta[0].replace(/[^A-G#b]/g, '') + '`'
    return reply(doc)
    }
}
