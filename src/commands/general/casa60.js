/**
 * Comando .plantasseguras — PLANTAS SEGURAS PARA PETS
 *
 * Plantas não tóxicas para casa com cão ou gato.
 */

const H = require('../../services/homeLifeService')

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
    name: 'plantasseguras',
    aliases: ["plantaspets"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Plantas não tóxicas para casa com cão ou gato',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const seguras = H.plantasSegurasPara()
    const toxicas = H.plantasToxicas()
    let doc = cab('PLANTAS SEGURAS PARA PETS', '🐾')
    doc += linha('Seguras', String(seguras.length))
    doc += linha('Tóxicas', String(toxicas.length))
    doc += sep()
    doc += bloco('✅ PODE TER EM CASA', seguras.map(p => p.nome + ' `' + prefix + 'planta' + p.chave + '`'))
    doc += bloco('⚠️ MELHOR FORA DO ALCANCE', toxicas.map(p => p.nome))
    doc += '\n☠️ *O caso mais grave*\nLírio verdadeiro é letal para gatos — inclusive o pólen e a água do vaso.\n\n'
    doc += '_Tóxica aqui significa "causa problema se ingerida", não "mata ao encostar"._\n'
    doc += '_Ingestão suspeita: procure um veterinário levando um pedaço da planta._'
    return reply(doc)
    }
}
