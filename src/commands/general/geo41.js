/**
 * Comando .qualestado — QUAL ESTADO É ESSE
 *
 * Descobre o estado pela capital, sigla, nome ou gentílico.
 */

const G = require('../../services/brazilGeoService')

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
    name: 'qualestado',
    aliases: ["deondee","capitalde"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Descobre o estado pela capital, sigla, nome ou gentílico',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ')
    if (!termo) {
        let doc = cab('QUAL ESTADO É ESSE', '🔍')
        doc += '📌 Uso: `' + prefix + 'qualestado <capital, sigla, nome ou gentílico>`\n\n'
        doc += '🧮 *Exemplos*\n'
        doc += '`' + prefix + 'qualestado Natal` — pela capital\n'
        doc += '`' + prefix + 'qualestado potiguar` — pelo gentílico\n'
        doc += '`' + prefix + 'qualestado PE` — pela sigla'
        return reply(doc)
    }
    const e = G.acharEstado(termo)
    if (!e) return reply('🔍 Não achei nada para `' + termo + '`.\n\n🗺️ _Ver todos:_ `' + prefix + 'estadosbrasil`')
    let doc = cab('QUAL ESTADO É ESSE', '🔍')
    doc += '🎯 *' + e.nome + ' (' + e.sigla + ')*\n\n'
    doc += linha('Capital', e.capital)
    doc += linha('Região', e.regiao)
    doc += linha('Gentílico', e.gentilico)
    doc += linha('Bioma', e.bioma)
    doc += sep()
    doc += '🔎 ' + e.marca + '\n\n'
    doc += '📖 _Ficha completa:_ `' + prefix + 'estado' + e.sigla.toLowerCase() + '`'
    return reply(doc)
    }
}
