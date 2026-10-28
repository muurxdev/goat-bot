/**
 * Comando .documentoctps — CARTEIRA DE TRABALHO
 *
 * Como tirar: Carteira de Trabalho.
 */

const C = require('../../services/civicService')

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
    name: 'documentoctps',
    aliases: ["tirarctps"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Como tirar: Carteira de Trabalho',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = C.DOCUMENTOS['ctps']
    let doc = cab("CARTEIRA DE TRABALHO", '🪪')
    doc += linha('Órgão', d.orgao)
    doc += linha('Prazo', d.prazo)
    doc += linha('Custo', d.custo)
    doc += linha('Onde', d.onde)
    doc += sep()
    doc += bloco('📋 O QUE LEVAR', d.precisa)
    doc += '\n⚠️ *Atenção*\n' + d.atencao
    doc += '\n\n_Confirme sempre no site oficial do órgão: regras mudam por estado._'
    return reply(doc)
    }
}
