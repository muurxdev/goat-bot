/**
 * Comando .esporteginasticaartistica — GINÁSTICA ARTÍSTICA
 *
 * Regras, origem e curiosidades do ginástica artística.
 */

const L = require('../../services/lifestyleService')

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
    name: 'esporteginasticaartistica',
    aliases: ["regrasginasticaartistica"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Regras, origem e curiosidades do ginástica artística',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = L.ESPORTES['ginastica']
    let doc = cab('GINÁSTICA ARTÍSTICA', '🏅')
    doc += linha('Jogadores', e.jogadores)
    doc += linha('Duração', e.duracao)
    doc += linha('Origem', e.origem)
    doc += sep()
    doc += '📋 *Como se ganha*\n' + e.regra + '\n\n'
    doc += '🔎 *Curiosidade*\n' + e.curiosidade
    doc += '\n\n🏟️ _Outros esportes:_ `' + prefix + 'listaesportes`'
    return reply(doc)
    }
}
