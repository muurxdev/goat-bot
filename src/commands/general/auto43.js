/**
 * Comando .infracaolicenciamento — DIRIGIR COM LICENCIAMENTO VENCIDO
 *
 * Infração de trânsito: Dirigir com licenciamento vencido — pontos e valor.
 */

const A = require('../../services/autoService')

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
    name: 'infracaolicenciamento',
    aliases: ["multalicenciamento"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Infração de trânsito: Dirigir com licenciamento vencido — pontos e valor',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const i = A.INFRACOES['licenciamento']
    let doc = cab("DIRIGIR COM LICENCIAMENTO VENCIDO", '🚨')
    doc += linha('Gravidade', i.gravidade)
    doc += linha('Pontos na CNH', String(i.pontos))
    doc += linha('Valor', A.moeda(i.valor))
    doc += linha('Artigo', i.artigo)
    doc += sep()
    doc += '📖 *Vale saber*\n' + i.detalhe + '\n\n'
    doc += '💸 *Com desconto de 20%* (pagando antes do vencimento e sem recorrer): ' + A.moeda(i.valor * 0.8) + '\n\n'
    doc += '_Valores do CTB, vigência ' + A.VIGENCIA_CTB + '._\n'
    doc += '🚨 _Todas as infrações:_ `' + prefix + 'infracoestransito`\n'
    doc += '⚖️ _Acha que foi indevida?_ `' + prefix + 'emergenciamultaindevida`'
    return reply(doc)
    }
}
