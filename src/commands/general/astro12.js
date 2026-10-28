/**
 * Comando .astroeris — ÉRIS
 *
 * Éris: tamanho, órbita, temperatura e o que o distingue.
 */

const A = require('../../services/astronomyService')

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
    name: 'astroeris',
    aliases: ["planetaeris"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Éris: tamanho, órbita, temperatura e o que o distingue',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = A.CORPOS['eris']
    let doc = cab("ÉRIS", '🪐')
    doc += linha('Tipo', c.tipo)
    doc += linha('Diâmetro', c.diametro.toLocaleString('pt-BR') + ' km')
    if (c.distancia) doc += linha('Distância do Sol', c.distancia.toLocaleString('pt-BR') + ' milhões de km')
    doc += linha('Ano', c.periodo)
    doc += linha('Luas', String(c.luas))
    doc += linha('Temperatura', c.temperatura)
    doc += linha('Gravidade', String(c.gravidade).replace('.', ',') + ' m/s²')
    doc += sep()
    doc += '🔭 *O que o distingue*\n' + c.fato
    const seuPeso = 70 * (c.gravidade / 9.81)
    doc += '\n\n⚖️ _Quem pesa 70 kg na Terra pesaria ' + seuPeso.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg ali._'
    doc += '\n🌌 _Sistema solar:_ `' + prefix + 'sistemasolar`'
    return reply(doc)
    }
}
