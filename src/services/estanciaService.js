/**
 * A ESTÂNCIA — mundos infinitos gerados por semente.
 *
 * O jogo tinha 10 mundos fixos: quem chegava ao último não tinha mais para
 * onde ir. A Estância resolve isso gerando mundos sob demanda, mas o ponto
 * importante é que a geração é DETERMINÍSTICA: a mesma semente devolve sempre
 * o mesmo mundo, com os mesmos monstros e o mesmo loot.
 *
 * Isso muda tudo em três frentes:
 *   - nada precisa ser guardado no banco; a semente É o mundo
 *   - dois jogadores com a mesma semente veem exatamente o mesmo lugar, então
 *     dá para combinar "encontro comigo em 4821"
 *   - um mundo pode ser reencontrado meses depois, intacto
 *
 * O mesmo motor serve os outros modos (masmorra, arena, raide): muda o formato
 * do desafio, não a forma de gerar. Um modo novo é uma entrada em MODOS.
 */

const logger = require('../core/logger')

/**
 * Gerador pseudoaleatório determinístico (mulberry32).
 *
 * `Math.random` não serve aqui: a graça é a semente reproduzir o mundo. Este
 * gerador é pequeno, rápido e sempre devolve a mesma sequência para a mesma
 * semente — em qualquer máquina, em qualquer dia.
 */
function geradorDe(semente) {
    let estado = semente >>> 0
    return function () {
        estado |= 0
        estado = (estado + 0x6D2B79F5) | 0
        let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** Converte qualquer texto numa semente numérica estável. */
function semearTexto(texto) {
    const t = String(texto || '').trim().toLowerCase()
    if (/^\d+$/.test(t)) return Number(t) % 4294967296
    let h = 2166136261
    for (let i = 0; i < t.length; i++) {
        h ^= t.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

const escolher = (rnd, lista) => lista[Math.floor(rnd() * lista.length)]
const entre = (rnd, min, max) => min + Math.floor(rnd() * (max - min + 1))

// ══════════════════════════════════════════════════════════════
// PEÇAS DE MONTAGEM
// ══════════════════════════════════════════════════════════════

/** Biomas: definem o tom, os monstros e os modificadores do lugar. */
const BIOMAS = {
    cinzas: { nome: 'Campos de Cinzas', emoji: '🌋', perigo: 1.2, riqueza: 1.0, criaturas: [['Cinzento', 'Cinzenta'], ['Carbonizado', 'Carbonizada'], ['Fumegante', 'Fumegante'], ['Incandescente', 'Incandescente']] },
    vazio: { nome: 'Vazio Silencioso', emoji: '🕳️', perigo: 1.5, riqueza: 1.3, criaturas: [['Oco', 'Oca'], ['Ausente', 'Ausente'], ['Silente', 'Silente'], ['Devorador', 'Devoradora']] },
    cristal: { nome: 'Planície de Cristal', emoji: '💎', perigo: 0.9, riqueza: 1.6, criaturas: [['Cristalino', 'Cristalina'], ['Refletor', 'Refletora'], ['Prismático', 'Prismática'], ['Faiscante', 'Faiscante']] },
    pantano: { nome: 'Pântano Antigo', emoji: '🐸', perigo: 1.1, riqueza: 0.9, criaturas: [['Lodoso', 'Lodosa'], ['Afogado', 'Afogada'], ['Pútrido', 'Pútrida'], ['Rastejante', 'Rastejante']] },
    ceu: { nome: 'Ilhas Suspensas', emoji: '☁️', perigo: 1.0, riqueza: 1.2, criaturas: [['Alado', 'Alada'], ['Etéreo', 'Etérea'], ['Ventoso', 'Ventosa'], ['Celeste', 'Celeste']] },
    ruinas: { nome: 'Ruínas Esquecidas', emoji: '🏛️', perigo: 1.3, riqueza: 1.4, criaturas: [['Guardião', 'Guardiã'], ['Sentinela', 'Sentinela'], ['Ancestral', 'Ancestral'], ['Espectral', 'Espectral']] },
    gelo: { nome: 'Ermo Congelado', emoji: '❄️', perigo: 1.2, riqueza: 1.1, criaturas: [['Gélido', 'Gélida'], ['Congelado', 'Congelada'], ['Glacial', 'Glacial'], ['Hibernante', 'Hibernante']] },
    sangue: { nome: 'Terras de Sangue', emoji: '🩸', perigo: 1.7, riqueza: 1.5, criaturas: [['Sanguinário', 'Sanguinária'], ['Faminto', 'Faminta'], ['Dilacerado', 'Dilacerada'], ['Carmesim', 'Carmesim']] },
    maquina: { nome: 'Complexo Mecânico', emoji: '⚙️', perigo: 1.1, riqueza: 1.3, criaturas: [['Automatizado', 'Automatizada'], ['Enferrujado', 'Enferrujada'], ['Serial', 'Serial'], ['Defeituoso', 'Defeituosa']] },
    floral: { nome: 'Jardim Selvagem', emoji: '🌺', perigo: 0.8, riqueza: 1.0, criaturas: [['Florido', 'Florida'], ['Espinhoso', 'Espinhosa'], ['Venenoso', 'Venenosa'], ['Enraizado', 'Enraizada']] },
    abismo: { nome: 'Abismo sem Fundo', emoji: '🌑', perigo: 2.0, riqueza: 2.0, criaturas: [['Abissal', 'Abissal'], ['Inominável', 'Inominável'], ['Antigo', 'Antiga'], ['Colossal', 'Colossal']] },
    aurora: { nome: 'Campos de Aurora', emoji: '🌌', perigo: 1.4, riqueza: 1.8, criaturas: [['Luminoso', 'Luminosa'], ['Astral', 'Astral'], ['Radiante', 'Radiante'], ['Constelado', 'Constelada']] }
}

/** Peças do nome do lugar. */
const NOME_PREFIXO = ['Vale', 'Domínio', 'Reino', 'Fenda', 'Trono', 'Sepulcro', 'Santuário', 'Fronteira', 'Coroa', 'Berço', 'Fosso', 'Miragem']

/**
 * Núcleos do nome, cada um com o SEU conector.
 *
 * Sortear o conector à parte gerava "Reino do Estrelas" e "Vale das Ossos". O
 * artigo depende do gênero e do número do substantivo, então ele viaja junto
 * com a palavra — não há como desencontrar.
 */
const NOME_NUCLEO = [
    { palavra: 'Ferro', com: 'do' },
    { palavra: 'Cinzas', com: 'das' },
    { palavra: 'Ecos', com: 'dos' },
    { palavra: 'Presságios', com: 'dos' },
    { palavra: 'Lamentos', com: 'dos' },
    { palavra: 'Estrelas', com: 'das' },
    { palavra: 'Ossos', com: 'dos' },
    { palavra: 'Marés', com: 'das' },
    { palavra: 'Segredos', com: 'dos' },
    { palavra: 'Tempestades', com: 'das' },
    { palavra: 'Sombras', com: 'das' },
    { palavra: 'Correntes', com: 'das' },
    { palavra: 'Espinhos', com: 'dos' },
    { palavra: 'Relíquias', com: 'das' },
    { palavra: 'Vigílias', com: 'das' },
    { palavra: 'Miragens', com: 'das' },
    { palavra: 'Silêncio', com: 'do' },
    { palavra: 'Abismo', com: 'do' },
    { palavra: 'Crepúsculo', com: 'do' },
    { palavra: 'Alvorecer', com: 'do' }
]

/**
 * Bases de criatura, cada uma com seu gênero.
 *
 * O adjetivo do bioma concorda com este gênero: sem isso saíam nomes como
 * "Serpente Sanguinário" e "Aranha Faminto".
 */
const CRIATURAS = [
    { nome: 'Lobo', f: false }, { nome: 'Serpente', f: true }, { nome: 'Golem', f: false },
    { nome: 'Aranha', f: true }, { nome: 'Corvo', f: false }, { nome: 'Javali', f: false },
    { nome: 'Espectro', f: false }, { nome: 'Quimera', f: true }, { nome: 'Verme', f: false },
    { nome: 'Titã', f: false }, { nome: 'Sabujo', f: false }, { nome: 'Basilisco', f: false },
    { nome: 'Gárgula', f: true }, { nome: 'Larva', f: true }, { nome: 'Fera', f: true },
    { nome: 'Coloso', f: false }, { nome: 'Víbora', f: true }, { nome: 'Abutre', f: false }
]

/** Escolhe o adjetivo do bioma na forma que concorda com a criatura. */
function adjetivoPara(rnd, bioma, ehFeminino) {
    const par = escolher(rnd, bioma.criaturas)
    return ehFeminino ? par[1] : par[0]
}

/** Peças do nome de loot. */
const LOOT_FORMA = ['Fragmento', 'Núcleo', 'Essência', 'Presa', 'Escama', 'Runa', 'Coração', 'Pluma', 'Lasca', 'Selo', 'Garra', 'Fibra']
const LOOT_QUALIDADE = [
    { nome: 'Comum', emoji: '🟢', peso: 55, valor: 1 },
    { nome: 'Incomum', emoji: '🔵', peso: 25, valor: 3 },
    { nome: 'Raro', emoji: '🟣', peso: 13, valor: 8 },
    { nome: 'Épico', emoji: '🟠', peso: 5, valor: 20 },
    { nome: 'Lendário', emoji: '🟡', peso: 2, valor: 60 }
]

/** Fenômenos que mudam as regras daquele lugar. */
const FENOMENOS = [
    { nome: 'Névoa Densa', efeito: 'Monstros aparecem mais fortes', perigo: 1.25, riqueza: 1.0 },
    { nome: 'Veia Rica', efeito: 'Loot cai com mais frequência', perigo: 1.0, riqueza: 1.4 },
    { nome: 'Silêncio Arcano', efeito: 'Menos XP, mais moedas', perigo: 1.0, riqueza: 1.3 },
    { nome: 'Tempestade Eterna', efeito: 'Tudo é mais perigoso e mais valioso', perigo: 1.4, riqueza: 1.4 },
    { nome: 'Calmaria', efeito: 'Lugar tranquilo, recompensa modesta', perigo: 0.7, riqueza: 0.8 },
    { nome: 'Eco do Passado', efeito: 'Criaturas antigas dão mais XP', perigo: 1.15, riqueza: 1.15 },
    { nome: 'Fratura Dimensional', efeito: 'Nada aqui segue a regra', perigo: 1.6, riqueza: 1.7 },
    { nome: 'Nenhum', efeito: 'Nada fora do comum', perigo: 1.0, riqueza: 1.0 }
]

/**
 * Modos da Estância. Cada um usa o mesmo motor e muda só as regras do desafio.
 * Modo novo = uma entrada aqui, sem tocar no gerador.
 */
const MODOS = {
    mundo: {
        nome: 'Mundo', emoji: '🌍',
        descricao: 'Território aberto para caçar sem pressa.',
        criaturas: [4, 6], perigoBase: 1.0, riquezaBase: 1.0, temChefe: false
    },
    masmorra: {
        nome: 'Masmorra', emoji: '🏚️',
        descricao: 'Corredor fechado: menos criaturas, mais perigo e um guardião no fim.',
        criaturas: [2, 3], perigoBase: 1.5, riquezaBase: 1.6, temChefe: true
    },
    arena: {
        nome: 'Arena', emoji: '⚔️',
        descricao: 'Ondas de inimigos em sequência, sem loot no meio do caminho.',
        criaturas: [5, 8], perigoBase: 1.3, riquezaBase: 0.7, temChefe: true
    },
    raide: {
        nome: 'Raide', emoji: '🐲',
        descricao: 'Um só alvo, colossal. Feito para grupo.',
        criaturas: [1, 1], perigoBase: 2.5, riquezaBase: 2.5, temChefe: true
    },
    abrigo: {
        nome: 'Abrigo', emoji: '🏕️',
        descricao: 'Lugar seguro: pouca ameaça, bom para recuperar e garimpar.',
        criaturas: [2, 4], perigoBase: 0.5, riquezaBase: 1.2, temChefe: false
    }
}


/**
 * ÂNCORAS DE DIFICULDADE, tiradas dos mundos fixos do jogo.
 *
 * A primeira versão usava uma curva inventada e gerava 200 mil de vida onde o
 * jogo dá 18 mil — o jogador perdia sempre, mesmo num lugar do nível dele. A
 * curva real do jogo não é uma potência limpa: fica quase plana até o nível
 * 100 e explode depois. Interpolar entre os mundos existentes garante que a
 * Estância seja tão difícil quanto o resto do jogo, em qualquer nível.
 *
 * [nível, vida, dano, XP]
 */
const ANCORAS = [
    [1, 650, 30, 70],
    [10, 1400, 65, 150],
    [20, 2500, 110, 260],
    [35, 4200, 170, 500],
    [50, 8000, 300, 1000],
    [80, 18000, 500, 1800],
    [105, 40000, 700, 3200],
    [150, 250000, 3200, 12000],
    [200, 900000, 8500, 45000],
    [300, 6000000, 45000, 300000]
]

/**
 * Perigo de um lugar médio (bioma × modo × fenômeno).
 *
 * Os três multiplicadores só somam para cima, então sem normalizar QUALQUER
 * lugar da Estância sairia mais difícil que o mundo fixo do mesmo nível.
 * Dividir por este valor faz o lugar médio empatar com o jogo — e mantém a
 * variação: bioma calmo fica abaixo, abismo fica acima.
 */
const PERIGO_NEUTRO = 1.45

/**
 * Valores base de uma criatura no nível pedido.
 * Interpola em escala logarítmica entre as âncoras — em escala linear, a
 * explosão do fim da curva achataria tudo que vem antes.
 */
function baseDoNivel(nivel) {
    const n = Math.max(1, Number(nivel) || 1)
    if (n <= ANCORAS[0][0]) return { hp: ANCORAS[0][1], dano: ANCORAS[0][2], xp: ANCORAS[0][3] }

    const ultimo = ANCORAS[ANCORAS.length - 1]
    if (n >= ultimo[0]) {
        // Acima do último mundo, segue a inclinação final em vez de estacionar.
        const [nA, hA, dA, xA] = ANCORAS[ANCORAS.length - 2]
        const fator = Math.pow(n / ultimo[0], Math.log(ultimo[1] / hA) / Math.log(ultimo[0] / nA))
        return { hp: ultimo[1] * fator, dano: ultimo[2] * fator, xp: ultimo[3] * fator }
    }

    for (let i = 0; i < ANCORAS.length - 1; i++) {
        const [nA, hA, dA, xA] = ANCORAS[i]
        const [nB, hB, dB, xB] = ANCORAS[i + 1]
        if (n < nA || n > nB) continue
        const t = (n - nA) / (nB - nA)
        const interp = (a, b) => Math.exp(Math.log(a) + t * (Math.log(b) - Math.log(a)))
        return { hp: interp(hA, hB), dano: interp(dA, dB), xp: interp(xA, xB) }
    }
    return { hp: ANCORAS[0][1], dano: ANCORAS[0][2], xp: ANCORAS[0][3] }
}

// ══════════════════════════════════════════════════════════════
// GERAÇÃO
// ══════════════════════════════════════════════════════════════

function sortearQualidade(rnd) {
    const total = LOOT_QUALIDADE.reduce((a, q) => a + q.peso, 0)
    let ponto = rnd() * total
    for (const q of LOOT_QUALIDADE) {
        ponto -= q.peso
        if (ponto <= 0) return q
    }
    return LOOT_QUALIDADE[0]
}

function gerarLoot(rnd, bioma, quantidade) {
    const itens = []
    const usados = new Set()
    for (let i = 0; i < quantidade; i++) {
        const q = sortearQualidade(rnd)
        const forma = escolher(rnd, LOOT_FORMA)
        const nucleo = escolher(rnd, NOME_NUCLEO)
        const nome = `${q.emoji} ${forma} ${nucleo.com} ${nucleo.palavra}`
        if (usados.has(nome)) continue
        usados.add(nome)
        // Chance cai conforme a raridade sobe: o lendário tem que doer.
        const chance = Math.max(1, Math.round(60 / q.valor * (bioma.riqueza || 1)))
        itens.push({ nome, qualidade: q.nome, emoji: q.emoji, chance, valor: q.valor })
    }
    return itens.sort((a, b) => b.chance - a.chance)
}

function gerarCriaturas(rnd, bioma, nivel, modo, fenomeno) {
    const [min, max] = modo.criaturas
    const quantidade = entre(rnd, min, max)
    const perigo = (bioma.perigo || 1) * (modo.perigoBase || 1) * (fenomeno.perigo || 1)
    const riqueza = (bioma.riqueza || 1) * (modo.riquezaBase || 1) * (fenomeno.riqueza || 1)

    const criaturas = []
    for (let i = 0; i < quantidade; i++) {
        const base = escolher(rnd, CRIATURAS)
        const adjetivo = adjetivoPara(rnd, bioma, base.f)
        // A base vem da curva real do jogo; perigo e riqueza só modulam em
        // torno dela, para o lugar continuar comparável a um mundo fixo.
        const b = baseDoNivel(nivel)
        const forca = 0.85 + (i * 0.12) + (rnd() * 0.2)
        const escala = perigo / PERIGO_NEUTRO
        const hp = Math.round(b.hp * escala * forca / 10) * 10
        const dano = Math.round(b.dano * escala * forca)
        const xp = Math.round(b.xp * forca)
        const moedas = Math.round(b.xp * 1.15 * riqueza * forca)
        criaturas.push({
            nome: `${base.nome} ${adjetivo}`,
            hp, dano, xp, moedas,
            loot: gerarLoot(rnd, bioma, entre(rnd, 2, 3))
        })
    }
    return criaturas.sort((a, b) => a.hp - b.hp)
}

/**
 * Gera um lugar a partir de uma semente e um modo.
 *
 * @param {string|number} semente qualquer texto ou número
 * @param {string} [modoChave] mundo | masmorra | arena | raide | abrigo
 * @param {number} [nivelAlvo] nível do lugar; sem isso, a semente decide
 */
function gerar(semente, modoChave = 'mundo', nivelAlvo = null) {
    const modo = MODOS[modoChave] || MODOS.mundo
    const sementeNum = semearTexto(semente)
    // O modo entra na semente para que a mesma "4821" dê lugares diferentes em
    // modos diferentes — senão a masmorra 4821 seria o mundo 4821 com outro nome.
    const rnd = geradorDe(sementeNum ^ semearTexto(modoChave))

    const chaveBioma = escolher(rnd, Object.keys(BIOMAS))
    const bioma = BIOMAS[chaveBioma]
    const fenomeno = escolher(rnd, FENOMENOS)
    // O nível é SEMPRE sorteado, mesmo quando vem de fora. Usar `||` aqui
    // pulava a chamada do gerador e desalinhava toda a sequência seguinte: o
    // mesmo lugar aparecia com outro nome ao ser recarregado do usuário.
    const nivelSorteado = entre(rnd, 1, 120)
    const nivel = Math.max(1, Math.min(999, Number(nivelAlvo) || nivelSorteado))

    const nucleo = escolher(rnd, NOME_NUCLEO)
    const nome = `${escolher(rnd, NOME_PREFIXO)} ${nucleo.com} ${nucleo.palavra}`
    const criaturas = gerarCriaturas(rnd, bioma, nivel, modo, fenomeno)

    let chefe = null
    if (modo.temChefe) {
        const base = escolher(rnd, CRIATURAS)
        const adjetivo = adjetivoPara(rnd, bioma, base.f)
        const perigo = (bioma.perigo || 1) * (modo.perigoBase || 1) * (fenomeno.perigo || 1)
        chefe = {
            nome: `${base.nome} ${adjetivo}, ${base.f
                ? escolher(rnd, ['a Vigilante', 'a Insaciável', 'a Primeira', 'a Última', 'a Esquecida', 'a Ruína'])
                : escolher(rnd, ['o Vigilante', 'o Insaciável', 'o Primeiro', 'o Último', 'o Esquecido', 'o Fim'])}`,
            hp: Math.round(baseDoNivel(nivel).hp * 6 * (perigo / PERIGO_NEUTRO) / 100) * 100,
            dano: Math.round(baseDoNivel(nivel).dano * 2.2 * (perigo / PERIGO_NEUTRO)),
            xp: Math.round(baseDoNivel(nivel).xp * 8),
            moedas: Math.round(baseDoNivel(nivel).xp * 10 * (bioma.riqueza || 1)),
            loot: gerarLoot(rnd, bioma, 4)
        }
    }

    return {
        semente: String(semente),
        sementeNum,
        modo: modoChave,
        modoNome: modo.nome,
        modoEmoji: modo.emoji,
        modoDescricao: modo.descricao,
        nome,
        nivel,
        bioma: { chave: chaveBioma, ...bioma },
        fenomeno,
        criaturas,
        chefe,
        perigo: Number(((bioma.perigo || 1) * (modo.perigoBase || 1) * (fenomeno.perigo || 1)).toFixed(2)),
        riqueza: Number(((bioma.riqueza || 1) * (modo.riquezaBase || 1) * (fenomeno.riqueza || 1)).toFixed(2))
    }
}

/** Semente aleatória legível, para quem só quer viajar. */
function sementeAleatoria() {
    return String(Math.floor(Math.random() * 900000) + 100000)
}

/**
 * Sugere lugares adequados ao nível do jogador.
 * Procura sementes até achar as que caem na faixa — barato porque a geração
 * é só aritmética, sem tocar em disco nem em rede.
 */
function sugerirPara(nivel, modoChave = 'mundo', quantidade = 5) {
    const alvo = Math.max(1, Number(nivel) || 1)
    const achados = []
    for (let i = 0; i < 400 && achados.length < quantidade; i++) {
        const s = String(entre(geradorDe(alvo * 7919 + i), 100000, 999999))
        const lugar = gerar(s, modoChave)
        if (Math.abs(lugar.nivel - alvo) <= Math.max(3, alvo * 0.25)) achados.push(lugar)
    }
    return achados
}

// ══════════════════════════════════════════════════════════════
// VIAGEM
// ══════════════════════════════════════════════════════════════

/** Onde o jogador está agora. Guardado em `extra`, sem migração. */
function localDe(user) {
    const s = user?.estanciaSemente
    if (!s) return null
    return gerar(s, user.estanciaModo || 'mundo', Number(user.estanciaNivel) || null)
}

function viajar(user, semente, modoChave = 'mundo') {
    const modo = MODOS[modoChave] ? modoChave : 'mundo'
    const lugar = gerar(semente, modo)
    user.estanciaSemente = String(semente)
    user.estanciaModo = modo
    user.estanciaNivel = lugar.nivel
    user.estanciaVisitas = (Number(user.estanciaVisitas) || 0) + 1
    return lugar
}

/** Escolhe uma criatura do lugar, com a semente do momento. */
function encontrar(lugar) {
    if (!lugar?.criaturas?.length) return null
    return lugar.criaturas[Math.floor(Math.random() * lugar.criaturas.length)]
}

/** Sorteia um loot da criatura conforme as chances geradas. */
function sortearLoot(criatura) {
    for (const item of criatura?.loot || []) {
        if (Math.random() * 100 < item.chance) return item
    }
    return null
}

function validarSemente(entrada) {
    const t = String(entrada || '').trim()
    if (!t) return { ok: false, erro: 'Informe uma semente.' }
    if (t.length > 32) return { ok: false, erro: 'A semente aceita no máximo 32 caracteres.' }
    if (!/^[\p{L}\p{N} _-]+$/u.test(t)) return { ok: false, erro: 'A semente aceita letras, números, espaço, hífen e sublinhado.' }
    return { ok: true, semente: t }
}

module.exports = {
    ANCORAS,
    PERIGO_NEUTRO,
    baseDoNivel,
    BIOMAS,
    MODOS,
    FENOMENOS,
    LOOT_QUALIDADE,
    geradorDe,
    semearTexto,
    gerar,
    sementeAleatoria,
    sugerirPara,
    localDe,
    viajar,
    encontrar,
    sortearLoot,
    validarSemente
}
