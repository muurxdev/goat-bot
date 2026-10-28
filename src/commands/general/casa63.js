/**
 * Comando .perigospet — O QUE NÃO PODE DAR
 *
 * Alimentos e substâncias perigosas para cães e gatos.
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
    name: 'perigospet',
    aliases: ["naopodedar"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Alimentos e substâncias perigosas para cães e gatos',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const especie = String(args[0] || '').toLowerCase()
    const alvo = especie.startsWith('gat') ? 'gatos' : especie.startsWith('c') ? 'cães' : ''
    if (!alvo) {
        let doc = cab('O QUE NÃO PODE DAR', '☠️')
        doc += '📌 Uso: `' + prefix + 'perigospet cachorro` ou `' + prefix + 'perigospet gato`\n\n'
        doc += linha('Itens catalogados', String(H.PERIGOS.length))
        doc += '\n☎️ *Suspeita de intoxicação*\nLeve o animal e a embalagem ao veterinário. Não provoque vômito por conta própria.'
        return reply(doc)
    }
    const lista = H.perigosDe(especie)
    let doc = cab('NÃO DÊ AO SEU ' + (alvo === 'gatos' ? 'GATO' : 'CÃO'), '☠️')
    doc += linha('Itens', String(lista.length)) + '\n'
    for (const p of lista) {
        const marca = p.nivel === 'letal' ? '💀' : p.nivel === 'muito tóxico' ? '🛑' : p.nivel === 'tóxico' ? '⚠️' : '🚫'
        doc += marca + ' *' + p.item + '* — ' + p.nivel + '\n   ' + p.porque + '\n\n'
    }
    doc += '☎️ *Se já comeu*\nProcure um veterinário levando a embalagem. Não provoque vômito por conta própria.'
    return reply(doc)
    }
}
