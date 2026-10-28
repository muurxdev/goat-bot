/**
 * Comando .contratointermitente — CONTRATO INTERMITENTE
 *
 * Tipo de contrato: Contrato intermitente.
 */

const L = require('../../services/laborService')

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
    name: 'contratointermitente',
    aliases: ["tipointermitente"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Tipo de contrato: Contrato intermitente',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = L.CONTRATOS['intermitente']
    let doc = cab("CONTRATO INTERMITENTE", '📄')
    doc += linha('Duração', c.duracao)
    doc += sep()
    doc += '⚙️ *Como funciona*\n' + c.comofunciona + '\n\n'
    doc += '✅ *Direitos*\n' + c.direitos + '\n\n'
    doc += '⚠️ *Atenção*\n' + c.atencao + '\n\n'
    doc += '📄 _Todos os contratos:_ `' + prefix + 'tiposcontrato`'
    return reply(doc)
    }
}
