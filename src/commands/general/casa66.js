/**
 * Comando .vacinaspet — CALENDÁRIO DE VACINAS
 *
 * Vacinas e rotina de cuidado para cães e gatos.
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
    name: 'vacinaspet',
    aliases: ["calendariovacina"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Vacinas e rotina de cuidado para cães e gatos',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const especie = String(args[0] || '').toLowerCase()
    const gato = especie.startsWith('gat') || especie.startsWith('fel')
    const cao = especie.startsWith('c') && !gato
    if (!gato && !cao) {
        let doc = cab('CALENDÁRIO DE VACINAS', '💉')
        doc += '📌 Uso: `' + prefix + 'vacinaspet cachorro` ou `' + prefix + 'vacinaspet gato`\n\n'
        doc += linha('Vacinas de cão', String(H.VACINAS.caes.length))
        doc += linha('Vacinas de gato', String(H.VACINAS.gatos.length))
        doc += '\n_A antirrábica é obrigatória por lei para os dois._'
        return reply(doc)
    }
    const lista = gato ? H.VACINAS.gatos : H.VACINAS.caes
    let doc = cab('VACINAS — ' + (gato ? 'GATO' : 'CÃO'), '💉')
    doc += linha('Vacinas', String(lista.length))
    doc += sep()
    for (const v of lista) {
        doc += '💉 *' + v.nome + '*\n'
        doc += '   Quando: ' + v.quando + '\n'
        doc += '   Reforço: ' + v.reforco + '\n'
        doc += '   Protege de: ' + v.protege + '\n\n'
    }
    doc += bloco('🗓️ ROTINA ALÉM DA VACINA', H.ROTINA_PET.map(r => r.item + ' — ' + r.frequencia))
    doc += '\n_Idades usuais dos protocolos brasileiros. Quem define o calendário do seu animal é o veterinário._\n'
    doc += '☠️ _O que não pode dar:_ `' + prefix + 'perigospet ' + (gato ? 'gato' : 'cachorro') + '`'
    return reply(doc)
    }
}
