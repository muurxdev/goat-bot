/**
 * Comando .bonusarvore — BÔNUS DA ÁRVORE
 *
 * O que suas habilidades somam nos atributos.
 */

const EQ = require('../../services/rpgEquipmentService')
const F = require('../../services/forgeService')
const SK = require('../../services/skillTreeService')
const dataService = require('../../services/dataService')
const Fmt = require('../../utils/formato')

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
    name: 'bonusarvore',
    aliases: ["efeitoarvore"],
    category: 'rpg',
    subcategory: 'Equipamento & Forja',
    description: 'O que suas habilidades somam nos atributos',
    examples: [' — soma os bônus de todas as habilidades que você domina'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const user = dataService.initializeUser(sender)
    const b = SK.bonusDe(user)
    const chaves = Object.keys(b)
    if (!chaves.length) {
        const temClasse = Boolean(SK.arvoreDe(user))
        return reply(Fmt.tela({
            emoji: '📊',
            titulo: 'Bônus da árvore',
            intro: temClasse
                ? 'Você ainda não domina nenhuma habilidade, então a árvore não soma nada. Quando dominar, aqui aparece quanto cada atributo ganha.'
                : 'Você ainda não tem classe, e a árvore de habilidades vem dela. Quando tiver, aqui aparece quanto cada atributo ganha.',
            secoes: [{ emoji: '📜', titulo: 'O que pode aparecer aqui', linhas: ['Ataque, defesa, vida, crítico, esquiva e bloqueio, em porcentagem'] }],
            dica: 'Os bônus da árvore valem de verdade no combate, somados ao equipamento e ao pet.',
            proximos: temClasse
                ? [{ nome: 'aprender', oque: 'ver o que dá para aprender' }, { nome: 'arvore', oque: 'ver a árvore' }]
                : [{ nome: 'classe', oque: 'escolher uma classe' }],
            prefix
        }))
    }
    const rotulos = { atkPct: 'Ataque', defPct: 'Defesa', hpPct: 'Vida', critPct: 'Crítico', esqPct: 'Esquiva', bloqPct: 'Bloqueio' }
    return reply(Fmt.tela({
        emoji: '📊',
        titulo: 'Bônus da árvore',
        intro: `Suas habilidades somam bônus em *${chaves.length}* atributo(s).`,
        secoes: [{ emoji: '📜', titulo: 'Bônus', linhas: chaves.map(k => Fmt.campo(rotulos[k] || k, '+' + b[k] + '%')) }],
        dica: 'Isso é aplicado de verdade no combate, sobre o total já formado por equipamento e pet.',
        proximos: [
            { nome: 'aprender', oque: 'aprender mais habilidades' },
            { nome: 'boneco', oque: 'ver a ficha completa' }
        ],
        prefix
    }))
    }
}
