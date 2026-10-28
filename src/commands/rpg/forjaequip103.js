/**
 * Comando .forjaorcamento — ATÉ ONDE VOCÊ CHEGA
 *
 * Até que nível de forja seu dinheiro leva.
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
    name: 'forjaorcamento',
    aliases: ["ateondeforjo"],
    category: 'rpg',
    subcategory: 'Equipamento & Forja',
    description: 'Até que nível de forja seu dinheiro leva',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const user = dataService.initializeUser(sender)
    const atual = Number(user.forgeLevel || user.forge_level) || 0
    const carteira = Number(user.coins) || 0
    const orcamento = parseInt(String(args[0] || '').replace(/\D/g, ''), 10) || carteira
    if (!orcamento) return reply('💰 Você não tem moedas e não informou um orçamento.\n\n📌 Exemplo: `' + prefix + 'forjaorcamento 1000000`')
    const r = F.ateOndeVai(atual, orcamento, user.level || 1)
    let doc = cab('ATÉ ONDE VOCÊ CHEGA', '💰')
    doc += linha('Orçamento', num(orcamento) + ' 🪙')
    doc += linha('Forja atual', '+' + atual)
    doc += sep()
    doc += linha('Chega em', '+' + r.nivelFinal)
    doc += linha('Sobe', String(r.subidas) + ' níveis')
    doc += linha('Gasta', num(r.gasto) + ' 🪙')
    doc += linha('Sobra', num(r.sobra) + ' 🪙')
    const g = F.ganhoDe(r.nivelFinal)
    doc += '\n' + bloco('📈 NO FIM VOCÊ TERIA', [
        '+' + num(g.atk) + ' de ataque',
        '+' + num(g.def) + ' de defesa',
        '+' + num(g.hp) + ' de vida'
    ])
    return reply(doc)
    }
}
