/**
 * Códice do RPG — as fichas do que já existe no jogo.
 *
 * O bot tem catálogos ricos (8 classes, 6 lendárias, 10 mundos, 14 chefes,
 * 9 pets, 5 raças, 5 elementos, 79 itens), mas nada os mostrava: o jogador
 * descobria um monstro ao morrer para ele e um requisito de classe lendária
 * por tentativa e erro. Este serviço transforma o catálogo em consulta.
 *
 * Tudo é LEITURA do catálogo real — nenhum número é reescrito aqui. Se o jogo
 * mudar um chefe, a ficha muda junto, porque a fonte é a mesma.
 */

const constantes = require('../utils/constants')
const personagem = require('./characterEngine')
const equipamentos = require('./rpgEquipmentService')
const logger = require('../core/logger')

function seguro(nome, fn, padrao = null) {
    try {
        return fn()
    } catch (err) {
        logger.warn(`[CODICE] ${nome} falhou: ${err.message}`)
        return padrao
    }
}

const catalogo = {
    classes: () => seguro('classes', () => constantes.classes || {}, {}),
    lendarias: () => seguro('lendarias', () => constantes.classesLendarias || {}, {}),
    mundos: () => seguro('mundos', () => constantes.mundos || {}, {}),
    bosses: () => seguro('bosses', () => constantes.bosses || {}, {}),
    pets: () => seguro('pets', () => constantes.petsDisponiveis || {}, {}),
    equipamentos: () => seguro('equipamentos', () => constantes.equipamentos || {}, {}),
    arenas: () => seguro('arenas', () => constantes.arenas || {}, {}),
    desafios: () => seguro('desafios', () => constantes.desafios || {}, {}),
    racas: () => seguro('racas', () => personagem.RACES || {}, {}),
    elementos: () => seguro('elementos', () => personagem.ELEMENTS || {}, {}),
    itens: () => seguro('itens', () => equipamentos.ITEMS_DB || [], [])
}

function num(v) {
    return Number(v || 0).toLocaleString('pt-BR')
}

/** Chance de loot em texto, com a raridade implícita no emoji. */
function chanceTexto(chance) {
    const c = Number(chance) || 0
    const icone = c >= 40 ? '🟢' : c >= 15 ? '🔵' : c >= 5 ? '🟣' : '🟡'
    return `${icone} ${c}%`
}

// ══════════════════════════════════════════════════════════════
// FICHAS
// ══════════════════════════════════════════════════════════════

function fichaClasse(chave) {
    const c = catalogo.classes()[chave]
    if (!c) return null
    return {
        tipo: 'classe',
        chave,
        nome: c.nome,
        linhas: [
            ['Descrição', c.descricao],
            ['Habilidade', c.habilidade]
        ],
        rodape: 'Escolha a classe com `.classe <nome>`. A habilidade vale enquanto ela estiver ativa.'
    }
}

function fichaLendaria(chave) {
    const c = catalogo.lendarias()[chave]
    if (!c) return null
    const linhas = [
        ['Requisito', c.requisito || 'não informado'],
        ['Habilidade', c.habilidade || '—']
    ]
    if (Array.isArray(c.loots) && c.loots.length) {
        linhas.push(['Materiais', c.loots.join(', ')])
    }
    return {
        tipo: 'classe lendária',
        chave,
        nome: c.nome,
        linhas,
        rodape: 'Classe lendária: exige o requisito cumprido antes de ser desbloqueada.'
    }
}

function fichaMundo(chave) {
    const m = catalogo.mundos()[chave]
    if (!m) return null
    const monstros = Array.isArray(m.monstros) ? m.monstros : []
    const linhas = [
        ['Nível mínimo', String(m.minLevel ?? 1)],
        ['Monstros', String(monstros.length)]
    ]
    if (monstros.length) {
        const hps = monstros.map(x => Number(x.hp) || 0)
        const xps = monstros.map(x => Number(x.xp) || 0)
        linhas.push(['Vida dos monstros', `${num(Math.min(...hps))} a ${num(Math.max(...hps))}`])
        linhas.push(['XP por monstro', `${num(Math.min(...xps))} a ${num(Math.max(...xps))}`])
    }
    if (Array.isArray(m.bosses) && m.bosses.length) {
        linhas.push(['Chefes', m.bosses.join(', ')])
    }
    return {
        tipo: 'mundo',
        chave,
        nome: m.nome,
        linhas,
        listas: monstros.length ? [{
            titulo: '👾 MONSTROS',
            itens: monstros.map(x => `${x.nome} — ${num(x.hp)} HP · ${x.dano} dano · ${num(x.xp)} XP`)
        }] : [],
        rodape: `Cace aqui com \`.hunt\` a partir do nível ${m.minLevel ?? 1}.`
    }
}

function fichaBoss(chave) {
    const b = catalogo.bosses()[chave]
    if (!b) return null
    const loot = Array.isArray(b.loot) ? b.loot : []
    return {
        tipo: 'chefe',
        chave,
        nome: b.nome,
        linhas: [
            ['Tipo', b.tipo || '—'],
            ['Vida base', num(b.vidaBase)],
            ['Efeito', b.efeito || 'nenhum']
        ],
        listas: loot.length ? [{
            titulo: '🎁 RECOMPENSAS',
            itens: loot.map(l => `${l.nome} — ${chanceTexto(l.chance)}`)
        }] : [],
        rodape: 'Enfrente com `.boss`. A vida base cresce conforme o número de participantes.'
    }
}

function fichaPet(chave) {
    const p = catalogo.pets()[chave]
    if (!p) return null
    const linhas = [
        ['Tipo', p.tipo || 'comum'],
        ['Bônus', p.bonus || '—']
    ]
    if (p.preco) linhas.push(['Preço', `${num(p.preco)} 🪙`])
    if (p.buffs) {
        const b = p.buffs
        const partes = []
        if (b.xpPct) partes.push(`+${b.xpPct}% XP`)
        if (b.danoPct) partes.push(`+${b.danoPct}% dano`)
        if (b.critPct) partes.push(`+${b.critPct}% crítico`)
        if (partes.length) linhas.push(['Efeito real', partes.join(' · ')])
    }
    return {
        tipo: 'companheiro',
        chave,
        nome: p.nome,
        linhas,
        rodape: 'Adote com `.pet`. O bônus vale em toda caçada e combate.'
    }
}

function fichaRaca(chave) {
    const r = catalogo.racas()[chave]
    if (!r) return null
    return {
        tipo: 'raça',
        chave,
        nome: `${r.emoji || ''} ${r.nome}`.trim(),
        linhas: [
            ['Traço', r.desc || '—'],
            ['Ataque', `+${num(r.bonusAtk)}`],
            ['Vida', `+${num(r.bonusHp)}`]
        ],
        rodape: 'A raça é escolhida uma vez e muda os atributos base do personagem.'
    }
}

function fichaElemento(chave) {
    const e = catalogo.elementos()[chave]
    if (!e) return null
    return {
        tipo: 'elemento',
        chave,
        nome: `${e.emoji || ''} ${e.nome}`.trim(),
        linhas: [['Efeito', e.desc || '—']],
        rodape: 'O elemento define o tipo de dano extra que você aplica.'
    }
}

// ══════════════════════════════════════════════════════════════
// COMPARAÇÕES E ÍNDICES
// ══════════════════════════════════════════════════════════════

/** Mundos ordenados por nível de entrada — a rota de progressão. */
function rotaDeMundos() {
    return Object.entries(catalogo.mundos())
        .map(([chave, m]) => ({
            chave,
            nome: m.nome,
            minLevel: Number(m.minLevel) || 1,
            monstros: (m.monstros || []).length,
            xpMedio: (m.monstros || []).length
                ? (m.monstros.reduce((a, x) => a + (Number(x.xp) || 0), 0) / m.monstros.length)
                : 0
        }))
        .sort((a, b) => a.minLevel - b.minLevel)
}

/** Chefes ordenados por vida — a escada de dificuldade. */
function escadaDeBosses() {
    return Object.entries(catalogo.bosses())
        .map(([chave, b]) => ({ chave, nome: b.nome, vida: Number(b.vidaBase) || 0, tipo: b.tipo, efeito: b.efeito }))
        .sort((a, b) => a.vida - b.vida)
}

/** Pets ordenados por preço, com o custo por ponto de bônus. */
function tabelaDePets() {
    return Object.entries(catalogo.pets())
        .map(([chave, p]) => {
            const b = p.buffs || {}
            const total = (Number(b.xpPct) || 0) + (Number(b.danoPct) || 0) + (Number(b.critPct) || 0)
            const preco = Number(p.preco) || 0
            return {
                chave,
                nome: p.nome,
                tipo: p.tipo,
                preco,
                bonusTotal: total,
                custoPorPonto: total ? preco / total : null
            }
        })
        .sort((a, b) => a.preco - b.preco)
}

/** Onde cada item de loot aparece — responde "onde consigo isso?". */
function ondeConseguir(termo) {
    const alvo = String(termo || '').toLowerCase().trim()
    if (!alvo) return []
    const achados = []

    for (const [chave, m] of Object.entries(catalogo.mundos())) {
        for (const mon of m.monstros || []) {
            for (const l of mon.loot || []) {
                if (String(l.nome).toLowerCase().includes(alvo)) {
                    achados.push({ item: l.nome, chance: l.chance, origem: `${mon.nome} (${m.nome})`, tipo: 'monstro', chaveOrigem: chave })
                }
            }
        }
    }
    for (const [chave, b] of Object.entries(catalogo.bosses())) {
        for (const l of b.loot || []) {
            if (String(l.nome).toLowerCase().includes(alvo)) {
                achados.push({ item: l.nome, chance: l.chance, origem: b.nome, tipo: 'chefe', chaveOrigem: chave })
            }
        }
    }
    return achados.sort((a, b) => (Number(b.chance) || 0) - (Number(a.chance) || 0))
}

/** Todo loot do jogo, sem repetição, com a melhor chance de cada um. */
function todoOLoot() {
    const mapa = new Map()
    const registrar = (nome, chance, origem) => {
        const atual = mapa.get(nome)
        if (!atual || chance > atual.chance) mapa.set(nome, { nome, chance, origem })
    }
    for (const m of Object.values(catalogo.mundos())) {
        for (const mon of m.monstros || []) {
            for (const l of mon.loot || []) registrar(l.nome, Number(l.chance) || 0, mon.nome)
        }
    }
    for (const b of Object.values(catalogo.bosses())) {
        for (const l of b.loot || []) registrar(l.nome, Number(l.chance) || 0, b.nome)
    }
    return [...mapa.values()].sort((a, b) => b.chance - a.chance)
}

module.exports = {
    catalogo,
    num,
    chanceTexto,
    fichaClasse,
    fichaLendaria,
    fichaMundo,
    fichaBoss,
    fichaPet,
    fichaRaca,
    fichaElemento,
    rotaDeMundos,
    escadaDeBosses,
    tabelaDePets,
    ondeConseguir,
    todoOLoot
}
