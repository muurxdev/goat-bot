/**
 * Comando .esquecerhabilidades — ESQUECER TUDO
 *
 * Devolve todos os pontos de habilidade.
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
    name: 'esquecerhabilidades',
    aliases: ["resetararvore"],
    category: 'rpg',
    subcategory: 'Equipamento & Forja',
    description: 'Devolve todos os pontos de habilidade',
    usage: '[confirmar]',
    examples: [' — mostra quantas habilidades seriam esquecidas', 'confirmar — zera a árvore e devolve os pontos'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const user = dataService.initializeUser(sender)
    const atuais = SK.pagas(user).filter(k => SK.arvoreDe(user)?.habilidades?.[k])
    if (!atuais.length) {
        return reply(Fmt.tela({
            emoji: '🧹',
            titulo: 'Nada para esquecer',
            intro: 'Você não domina nenhuma habilidade da árvore da sua classe, então não há pontos para devolver.',
            dica: 'Este comando serve para refazer a árvore: ele devolve todos os pontos gastos para você escolher de novo.',
            proximos: [
                { nome: 'aprender', oque: 'ver o que dá para aprender' },
                { nome: 'arvore', oque: 'ver a árvore da sua classe' }
            ],
            prefix
        }))
    }
    if (String(args[0] || '').toLowerCase() !== 'confirmar') {
        const nomes = atuais.map(k => SK.arvoreDe(user).habilidades[k].nome)
        return reply(Fmt.tela({
            emoji: '🧹',
            titulo: 'Esquecer a árvore?',
            intro: `Isso esquece *${atuais.length}* habilidade(s) e devolve todos os pontos. Os bônus delas somem até você aprender de novo.`,
            secoes: [{ emoji: '📜', titulo: 'Serão esquecidas', linhas: Fmt.lista(nomes) }],
            dica: 'Nada muda até você confirmar.',
            proximos: [{ nome: 'esquecerhabilidades', args: 'confirmar', oque: 'confirmar e zerar a árvore' }],
            prefix
        }))
    }
    const r = SK.esquecerTudo(user)
    return reply(Fmt.tela({
        emoji: '🧹',
        titulo: 'Árvore zerada',
        intro: `${r.devolvidas} habilidade(s) esquecida(s). Os pontos voltaram e você pode escolher de novo.`,
        secoes: [{ emoji: '📊', titulo: 'Pontos', linhas: [Fmt.campo('Livres agora', num(SK.saldoDe(user).livres))] }],
        proximos: [
            { nome: 'aprender', oque: 'escolher as novas habilidades' },
            { nome: 'arvore', oque: 'ver a árvore' }
        ],
        prefix
    }))
    }
}
