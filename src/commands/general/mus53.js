/**
 * Comando .bpmgenero — BPM DO GÊNERO
 *
 * Andamento e compasso típicos de um gênero.
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
    name: 'bpmgenero',
    aliases: ["andamento","metronomo"],
    category: 'general',
    subcategory: 'Música',
    description: 'Andamento e compasso típicos de um gênero',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const g = args[0] ? M.bpmDe(args[0]) : null
    if (!g) {
        let doc = cab('BPM DO GÊNERO', '🥁')
        doc += '📌 Uso: `' + prefix + 'bpmgenero <gênero>`\n\n'
        doc += bloco('🎶 GÊNEROS', Object.keys(M.GENEROS))
        doc += '\n🧮 *Exemplo*\n`' + prefix + 'bpmgenero samba`'
        return reply(doc)
    }
    let doc = cab('BPM — ' + g.nome.toUpperCase(), '🥁')
    doc += linha('Andamento', g.bpm + ' BPM')
    doc += linha('Compasso', g.compasso)
    doc += sep()
    doc += '🎯 *Como usar*\nPonha o metrônomo no meio da faixa e suba aos poucos. Tocar devagar e limpo constrói velocidade; tocar rápido e sujo constrói erro.\n\n'
    doc += '🎶 _Sobre o gênero:_ `' + prefix + 'genero' + String(args[0]).toLowerCase() + '`'
    return reply(doc)
    }
}
