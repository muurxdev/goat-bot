/**
 * Comando .raridadetranscendente — RARIDADE:  TRANSCENDENTE
 *
 * Todos os equipamentos de raridade Transcendente.
 */

const EQ = require('../../services/rpgEquipmentService')
const F = require('../../services/forgeService')
const SK = require('../../services/skillTreeService')
const dataService = require('../../services/dataService')

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

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }

/** Ficha de um item do catálogo. */
function fichaItem(id) {
    const i = EQ.ITEMS_DB[id]
    if (!i) return '❌ Esse item não existe mais no catálogo.'
    let doc = cab(String(i.nome).toUpperCase(), '⚔️')
    doc += linha('Raridade', i.raridade)
    doc += linha('Encaixe', i.slot)
    doc += linha('Tipo', i.tipo || i.slot)
    doc += sep()
    if (i.atk) doc += linha('Ataque', '+' + num(i.atk))
    if (i.def) doc += linha('Defesa', '+' + num(i.def))
    if (i.hp) doc += linha('Vida', '+' + num(i.hp))
    if (i.crit) doc += linha('Crítico', '+' + i.crit + '%')
    if (i.buffs) {
        const b = []
        if (i.buffs.danoPct) b.push('+' + i.buffs.danoPct + '% dano')
        if (i.buffs.defPct) b.push('+' + i.buffs.defPct + '% defesa')
        if (i.buffs.xpPct) b.push('+' + i.buffs.xpPct + '% XP')
        if (i.buffs.critPct) b.push('+' + i.buffs.critPct + '% crítico')
        if (b.length) doc += linha('Bônus percentual', b.join(' · '))
    }
    doc += linha('Poder de combate', num(i.cp))
    doc += linha('Preço', num(i.preco) + ' 🪙')
    if (i.preco && i.cp) doc += linha('Custo por ponto', num(Math.round(i.preco / i.cp)) + ' 🪙')
    return doc
}

/** Itens do catálogo por um filtro qualquer. */
function itensPor(filtro) {
    return Object.entries(EQ.ITEMS_DB).map(([id, i]) => ({ id, ...i })).filter(filtro)
}

module.exports = {
    name: 'raridadetranscendente',
    aliases: ["itenstranscendente"],
    category: 'rpg',
    subcategory: 'Equipamento & Forja',
    description: 'Todos os equipamentos de raridade Transcendente',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const itens = itensPor(i => i.raridade === "🔥 Transcendente").sort((a, b) => (b.cp || 0) - (a.cp || 0))
    let doc = cab('RARIDADE', '💎')
    doc += linha('Faixa', "🔥 Transcendente")
    doc += linha('Peças', String(itens.length)) + '\n'
    for (const i of itens) doc += '┃ ' + i.nome + ' _(' + i.slot + ')_ — ' + num(i.cp) + ' CP\n'
    if (itens.length) {
        const media = Math.round(itens.reduce((a, i) => a + (i.preco || 0), 0) / itens.length)
        doc += '\n' + linha('Preço médio', num(media) + ' 🪙')
    }
    return reply(doc)
    }
}
