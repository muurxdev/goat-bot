/**
 * A FORJA — as contas do ferreiro, fora do comando.
 *
 * O custo por nível, a chance de sucesso e o ganho de atributo viviam dentro
 * de `forjar.js`, cada um numa linha solta. Não dava para responder "quanto
 * custa chegar no +30?" sem tentar e gastar, nem para o jogador decidir se
 * vale a pena antes de queimar as moedas.
 *
 * As fórmulas aqui são AS MESMAS do comando — este arquivo é a fonte, e o
 * comando passa a ler daqui. Se a economia mudar, muda num lugar só.
 */

const logger = require('../core/logger')

/** Ganho de atributo por nível de forja (espelha characterEngine). */
const GANHO_POR_NIVEL = { atk: 50, def: 35, hp: 120 }

/** Chance mínima e máxima de sucesso, e a queda por nível já alcançado. */
const CHANCE_MAXIMA = 95
const CHANCE_MINIMA = 40
const QUEDA_POR_NIVEL = 4

/** A cada mil níveis de personagem, +3% de chance na forja. */
const BUFF_POR_MILHAR = 3

/** Teto de segurança de tentativas numa única execução. */
const TETO_TENTATIVAS = 100000

/** Fração da carteira que o modo ultramax aceita gastar. */
const ULTRAMAX_FRACAO = 0.70

/** Custo em moedas para alcançar um nível de forja. */
function custoDoNivel(nivelAlvo) {
    const n = Math.max(1, Math.floor(Number(nivelAlvo) || 1))
    return Math.floor(400 + (n * 350) + Math.pow(n, 1.4) * 80)
}

/**
 * Chance de sucesso ao tentar sair de `nivelAtual` para o próximo.
 * O buff de personagem compensa a queda, mas o teto de 95% nunca é ultrapassado.
 */
function chanceDeSucesso(nivelAtual, nivelPersonagem = 1) {
    const base = Math.max(CHANCE_MINIMA, CHANCE_MAXIMA - (Math.max(0, Number(nivelAtual) || 0) * QUEDA_POR_NIVEL))
    const buff = Math.floor(Math.max(1, Number(nivelPersonagem) || 1) / 1000) * BUFF_POR_MILHAR
    return Math.min(CHANCE_MAXIMA, base + buff)
}

/** Quantas tentativas, em média, para subir um nível com essa chance. */
function tentativasEsperadas(chancePct) {
    const c = Math.max(1, Number(chancePct) || 1) / 100
    return 1 / c
}

/**
 * Custo esperado para ir de um nível a outro.
 *
 * "Esperado" porque a forja falha: o custo real é o custo do nível vezes o
 * número médio de tentativas. Somar só o custo nominal enganaria o jogador.
 */
function custoAte(nivelAtual, nivelAlvo, nivelPersonagem = 1) {
    const de = Math.max(0, Math.floor(Number(nivelAtual) || 0))
    const ate = Math.max(de, Math.floor(Number(nivelAlvo) || 0))
    if (ate === de) return { niveis: 0, nominal: 0, esperado: 0, tentativas: 0, passos: [] }

    let nominal = 0, esperado = 0, tentativas = 0
    const passos = []
    for (let n = de; n < ate; n++) {
        const custo = custoDoNivel(n + 1)
        const chance = chanceDeSucesso(n, nivelPersonagem)
        const tent = tentativasEsperadas(chance)
        nominal += custo
        esperado += custo * tent
        tentativas += tent
        passos.push({ nivel: n + 1, custo, chance, tentativas: tent, custoEsperado: custo * tent })
    }
    return { niveis: ate - de, nominal, esperado: Math.round(esperado), tentativas: Math.round(tentativas), passos }
}

/**
 * Até onde um orçamento leva, simulando as falhas.
 * Usa o custo esperado, não o nominal — é a resposta honesta para "com
 * 1 milhão eu chego em quanto?".
 */
function ateOndeVai(nivelAtual, orcamento, nivelPersonagem = 1) {
    let nivel = Math.max(0, Math.floor(Number(nivelAtual) || 0))
    let restante = Math.max(0, Number(orcamento) || 0)
    let gasto = 0, subidas = 0

    while (subidas < TETO_TENTATIVAS) {
        const custo = custoDoNivel(nivel + 1)
        const chance = chanceDeSucesso(nivel, nivelPersonagem)
        const esperado = custo * tentativasEsperadas(chance)
        if (restante < esperado) break
        restante -= esperado
        gasto += esperado
        nivel++
        subidas++
    }
    return { nivelFinal: nivel, subidas, gasto: Math.round(gasto), sobra: Math.round(restante) }
}

/** O que um nível de forja dá em atributos. */
function ganhoDe(nivel) {
    const n = Math.max(0, Math.floor(Number(nivel) || 0))
    return { atk: n * GANHO_POR_NIVEL.atk, def: n * GANHO_POR_NIVEL.def, hp: n * GANHO_POR_NIVEL.hp }
}

/**
 * Custo por ponto de ataque ganho num nível — mostra onde a forja deixa de
 * compensar. O número sobe sempre, e é isso que define o ponto de parada.
 */
function eficienciaDoNivel(nivel, nivelPersonagem = 1) {
    const custo = custoDoNivel(nivel)
    const chance = chanceDeSucesso(nivel - 1, nivelPersonagem)
    const esperado = custo * tentativasEsperadas(chance)
    return {
        nivel,
        custo,
        chance,
        custoEsperado: Math.round(esperado),
        porAtaque: Math.round(esperado / GANHO_POR_NIVEL.atk),
        porPontoTotal: Math.round(esperado / (GANHO_POR_NIVEL.atk + GANHO_POR_NIVEL.def + GANHO_POR_NIVEL.hp / 10))
    }
}

/** Tabela de referência de vários níveis de uma vez. */
function tabela(deNivel, ateNivel, nivelPersonagem = 1) {
    const de = Math.max(1, Math.floor(Number(deNivel) || 1))
    const ate = Math.min(de + 40, Math.max(de, Math.floor(Number(ateNivel) || de)))
    const linhas = []
    for (let n = de; n <= ate; n++) linhas.push(eficienciaDoNivel(n, nivelPersonagem))
    return linhas
}

/** O nível em que a chance de sucesso encosta no piso. */
function nivelDoPiso(nivelPersonagem = 1) {
    for (let n = 0; n < 200; n++) {
        if (chanceDeSucesso(n, nivelPersonagem) <= CHANCE_MINIMA) return n
    }
    return null
}

module.exports = {
    GANHO_POR_NIVEL,
    CHANCE_MAXIMA,
    CHANCE_MINIMA,
    QUEDA_POR_NIVEL,
    BUFF_POR_MILHAR,
    TETO_TENTATIVAS,
    ULTRAMAX_FRACAO,
    custoDoNivel,
    chanceDeSucesso,
    tentativasEsperadas,
    custoAte,
    ateOndeVai,
    ganhoDe,
    eficienciaDoNivel,
    tabela,
    nivelDoPiso
}
