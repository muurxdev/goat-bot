/**
 * Mesa de apostas — análise, probabilidade e controle.
 *
 * O bot já tem dezenas de jogos de azar (roleta, slots, blackjack, crash…), mas
 * nenhum deles dizia ao jogador quanto ele realmente ganhou ou perdeu no
 * conjunto. Este serviço olha o razão de transações, separa o que é aposta e
 * responde o que os jogos não respondem: você está no lucro? qual jogo te trata
 * melhor? quanto dá para apostar sem quebrar?
 *
 * Também traz as contas de probabilidade (valor esperado, Kelly, variância) que
 * são o único jeito honesto de falar sobre aposta: a casa sempre tem vantagem,
 * e o número mostra isso melhor que qualquer aviso.
 */

const { q } = require('../database/connection')
const dataService = require('./dataService')
const logger = require('../core/logger')

/** Tipos de transação que representam aposta. */
const PADRAO_APOSTA = /(aposta|bet|cassino|casino|roleta|slot|blackjack|bingo|crash|raspadinha|loteria|jackpot|dado|mines|baccarat|sorte)/i

/**
 * Vantagem da casa em cada jogo, em fração do valor apostado.
 * São os números que os próprios comandos usam; ficam aqui para que
 * `.apostaodds` não invente probabilidade.
 */
const JOGOS = {
    caraoucoroa: { nome: 'Cara ou Coroa', chance: 0.50, retorno: 1.9, risco: 'baixo' },
    dado: { nome: 'Dado', chance: 1 / 6, retorno: 5.5, risco: 'alto' },
    roleta: { nome: 'Roleta', chance: 0.486, retorno: 2.0, risco: 'médio' },
    roletacores: { nome: 'Roleta de Cores', chance: 0.333, retorno: 2.9, risco: 'médio' },
    slots: { nome: 'Caça-níquel', chance: 0.12, retorno: 7.0, risco: 'alto' },
    blackjack: { nome: 'Blackjack', chance: 0.47, retorno: 2.0, risco: 'baixo' },
    baccarat: { nome: 'Baccarat', chance: 0.458, retorno: 2.0, risco: 'baixo' },
    crash: { nome: 'Crash', chance: 0.45, retorno: 2.2, risco: 'alto' },
    mines: { nome: 'Mines', chance: 0.30, retorno: 3.2, risco: 'alto' },
    bingo: { nome: 'Bingo', chance: 0.08, retorno: 11.0, risco: 'altíssimo' },
    raspadinha: { nome: 'Raspadinha', chance: 0.20, retorno: 4.5, risco: 'alto' },
    loteria: { nome: 'Loteria', chance: 0.01, retorno: 80.0, risco: 'altíssimo' }
}

function moeda(v) { return `${Math.round(Number(v) || 0).toLocaleString('pt-BR')} 🪙` }

/** Valor esperado por moeda apostada. Negativo significa prejuízo no longo prazo. */
function valorEsperado(chance, retorno) {
    const c = Math.max(0, Math.min(1, Number(chance) || 0))
    const r = Math.max(0, Number(retorno) || 0)
    return c * r - 1
}

/**
 * Critério de Kelly: fração da banca que maximiza crescimento.
 * Devolve 0 quando o jogo tem valor esperado negativo — que é o caso de todos
 * os jogos da casa. É a resposta matemática para "quanto devo apostar".
 */
function kelly(chance, retorno) {
    const p = Math.max(0, Math.min(1, Number(chance) || 0))
    const b = (Number(retorno) || 0) - 1
    if (b <= 0) return 0
    const f = (p * b - (1 - p)) / b
    return Math.max(0, f)
}

/** Desvio padrão do resultado de uma aposta unitária. */
function desvio(chance, retorno) {
    const p = Math.max(0, Math.min(1, Number(chance) || 0))
    const r = Number(retorno) || 0
    const media = p * r
    const variancia = p * Math.pow(r - media, 2) + (1 - p) * Math.pow(0 - media, 2)
    return Math.sqrt(variancia)
}

/**
 * Simula uma sequência de apostas.
 * Existe para mostrar, com número, o que "tentar recuperar" costuma dar.
 */
function simular(chance, retorno, valor, rodadas, banca) {
    let saldo = Number(banca) || 0
    let maiorSaldo = saldo, menorSaldo = saldo
    let vitorias = 0, quebrou = false, rodadasFeitas = 0
    for (let i = 0; i < rodadas; i++) {
        if (saldo < valor) { quebrou = true; break }
        rodadasFeitas++
        saldo -= valor
        if (Math.random() < chance) { saldo += valor * retorno; vitorias++ }
        maiorSaldo = Math.max(maiorSaldo, saldo)
        menorSaldo = Math.min(menorSaldo, saldo)
    }
    return { saldoFinal: saldo, vitorias, rodadasFeitas, quebrou, maiorSaldo, menorSaldo, resultado: saldo - (Number(banca) || 0) }
}

// ══════════════════════════════════════════════════════════════
// HISTÓRICO REAL
// ══════════════════════════════════════════════════════════════

/** Movimentações de aposta do jogador, lidas do razão. */
function historico(jid, { limite = 200, dias = null } = {}) {
    try {
        const cond = ['user_jid = ?']
        const params = [jid]
        if (dias) { cond.push("created_at >= datetime('now', ?)"); params.push(`-${Math.floor(dias)} days`) }
        params.push(limite)
        return q(`SELECT * FROM transactions WHERE ${cond.join(' AND ')} ORDER BY created_at DESC LIMIT ?`)
            .all(...params)
            .filter(l => PADRAO_APOSTA.test(String(l.type || '') + ' ' + String(l.description || '')))
    } catch (err) {
        logger.warn(`[APOSTA] Histórico de ${jid} falhou: ${err.message}`)
        return []
    }
}

/** Resumo do desempenho: quanto apostou, quanto voltou, saldo. */
function desempenho(jid, dias = null) {
    const linhas = historico(jid, { limite: 500, dias })
    let apostado = 0, recebido = 0, vitorias = 0, derrotas = 0
    for (const l of linhas) {
        const valor = Number(l.amount) || 0
        if (valor >= 0) { recebido += valor; vitorias++ }
        else { apostado += Math.abs(valor); derrotas++ }
    }
    const rodadas = vitorias + derrotas
    return {
        rodadas,
        vitorias,
        derrotas,
        apostado,
        recebido,
        saldo: recebido - apostado,
        taxaAcerto: rodadas ? (vitorias / rodadas) * 100 : 0,
        retornoMedio: apostado ? (recebido / apostado) * 100 : 0
    }
}

/** Desempenho separado por jogo. */
function porJogo(jid, dias = null) {
    const linhas = historico(jid, { limite: 500, dias })
    const mapa = new Map()
    for (const l of linhas) {
        const texto = String(l.type || '') + ' ' + String(l.description || '')
        const chave = Object.keys(JOGOS).find(k => new RegExp(k, 'i').test(texto)) || 'outros'
        const atual = mapa.get(chave) || { jogo: chave, rodadas: 0, apostado: 0, recebido: 0, vitorias: 0 }
        const valor = Number(l.amount) || 0
        atual.rodadas++
        if (valor >= 0) { atual.recebido += valor; atual.vitorias++ } else atual.apostado += Math.abs(valor)
        mapa.set(chave, atual)
    }
    return [...mapa.values()]
        .map(x => ({ ...x, saldo: x.recebido - x.apostado }))
        .sort((a, b) => b.rodadas - a.rodadas)
}

/** Maior sequência de vitórias e de derrotas no histórico. */
function sequencias(jid) {
    const linhas = historico(jid, { limite: 500 }).reverse()
    let maiorV = 0, maiorD = 0, atualV = 0, atualD = 0
    for (const l of linhas) {
        if ((Number(l.amount) || 0) >= 0) { atualV++; atualD = 0; maiorV = Math.max(maiorV, atualV) }
        else { atualD++; atualV = 0; maiorD = Math.max(maiorD, atualD) }
    }
    const ultima = linhas[linhas.length - 1]
    return {
        maiorVitorias: maiorV,
        maiorDerrotas: maiorD,
        atual: atualV || atualD,
        atualTipo: atualV ? 'vitórias' : atualD ? 'derrotas' : 'nenhuma'
    }
}

/** Ranking de apostadores por volume, entre os registrados. */
function rankingApostadores(limite = 10) {
    try {
        return q(`SELECT user_jid, COUNT(*) AS rodadas, SUM(ABS(amount)) AS volume
                  FROM transactions
                  WHERE type LIKE '%aposta%' OR type LIKE '%bet%' OR type LIKE '%cassino%'
                  GROUP BY user_jid ORDER BY volume DESC LIMIT ?`).all(limite)
    } catch (err) {
        logger.warn(`[APOSTA] Ranking de apostadores falhou: ${err.message}`)
        return []
    }
}

// ══════════════════════════════════════════════════════════════
// LIMITES E AUTOCONTROLE
// ══════════════════════════════════════════════════════════════

function limites(user) {
    return {
        porAposta: Number(user?.apostaLimite) || 0,
        diario: Number(user?.apostaLimiteDiario) || 0,
        pausaAte: Number(user?.apostaPausaAte) || 0,
        meta: Number(user?.apostaMeta) || 0,
        stopPerda: Number(user?.apostaStopPerda) || 0
    }
}

function salvarLimite(user, chave, valor) {
    const permitidas = new Set(['apostaLimite', 'apostaLimiteDiario', 'apostaPausaAte', 'apostaMeta', 'apostaStopPerda'])
    if (!permitidas.has(chave)) {
        logger.warn(`[APOSTA] Limite "${chave}" não existe — ignorado.`)
        return false
    }
    user[chave] = valor
    dataService.saveUser(user)
    return true
}

/** Está em pausa autoimposta? */
function emPausa(user) {
    const ate = Number(user?.apostaPausaAte) || 0
    return ate > Date.now() ? { pausado: true, ate, restanteMs: ate - Date.now() } : { pausado: false }
}

function duracao(ms) {
    const s = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    if (d) return `${d}d ${h}h`
    if (h) return `${h}h ${m}min`
    return `${m}min`
}

module.exports = {
    JOGOS,
    PADRAO_APOSTA,
    moeda,
    duracao,
    valorEsperado,
    kelly,
    desvio,
    simular,
    historico,
    desempenho,
    porJogo,
    sequencias,
    rankingApostadores,
    limites,
    salvarLimite,
    emPausa
}
