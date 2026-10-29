/**
 * Tesouraria de Liones — leitura e cálculo sobre o dinheiro do jogador.
 *
 * O razão (tabela `transactions`) já era gravado pelo `.banco`, mas ninguém o
 * lia: dava para depositar e sacar sem nunca saber para onde o dinheiro foi.
 * Este serviço transforma esse histórico em respostas — para onde foi, quanto
 * sobra, quanto tempo dura, quanto rende — e concentra as contas para que os
 * comandos sejam só apresentação.
 *
 * Onde o dinheiro mora:
 *   coins       → carteira, gasta e é roubada
 *   bank        → banco, protegido e rende
 *   vault_coins → cofre, sobrevive até ao renascimento
 */

const { q } = require('../database/connection')
const dataService = require('./dataService')
const logger = require('../core/logger')

/** Tipos de movimentação que somam ao patrimônio do jogador. */
const TIPOS_ENTRADA = new Set(['deposit', 'deposito', 'income', 'salario', 'premio', 'transfer_in', 'refund'])

/** Quanto rende, por dia, o dinheiro parado no banco. */
const RENDIMENTO_DIARIO = 0.005

/** Tarifas fixas do Reino. Ficam aqui para o `.bancotaxas` não inventar valores. */
const TARIFAS = {
    saque: 0.00,
    transferencia: 0.02,
    emprestimo: 0.15,
    seguro: 0.05
}

function moeda(valor) {
    return `${Math.round(Number(valor) || 0).toLocaleString('pt-BR')} 🪙`
}

/** Soma carteira, banco e cofre de um usuário já carregado. */
function patrimonio(user) {
    const carteira = Number(user?.coins) || 0
    const banco = Number(user?.bank) || 0
    const cofre = Number(user?.vaultCoins ?? user?.vault_coins) || 0
    return { carteira, banco, cofre, total: carteira + banco + cofre }
}

/**
 * Lê o razão do jogador.
 *
 * @param {string} jid
 * @param {object} [opts]
 * @param {number} [opts.limite]
 * @param {number} [opts.dias] recorta a janela de tempo
 * @param {'entrada'|'saida'} [opts.sentido]
 */
function razao(jid, { limite = 20, dias = null, sentido = null } = {}) {
    try {
        const condicoes = ['user_jid = ?']
        const params = [jid]
        if (dias) {
            condicoes.push("created_at >= datetime('now', ?)")
            params.push(`-${Math.max(1, Math.floor(dias))} days`)
        }
        params.push(limite)
        const linhas = q(`SELECT * FROM transactions
                          WHERE ${condicoes.join(' AND ')}
                          ORDER BY created_at DESC LIMIT ?`).all(...params)
        if (!sentido) return linhas
        return linhas.filter(l => (sentido === 'entrada') === ehEntrada(l))
    } catch (err) {
        logger.warn(`[BANCO] Razão de ${jid} falhou: ${err.message}`)
        return []
    }
}

/** Uma movimentação é entrada quando soma ao jogador. */
function ehEntrada(linha) {
    const tipo = String(linha?.type || '').toLowerCase()
    if (TIPOS_ENTRADA.has(tipo)) return true
    return Number(linha?.amount) > 0 && !/saque|withdraw|pagamento|compra|taxa/i.test(tipo)
}

/** Agrupa as movimentações por tipo, somando valores. */
function porTipo(jid, dias = 30) {
    const linhas = razao(jid, { limite: 500, dias })
    const mapa = new Map()
    for (const l of linhas) {
        const tipo = String(l.type || 'outro').toLowerCase()
        const atual = mapa.get(tipo) || { tipo, quantidade: 0, valor: 0 }
        atual.quantidade++
        atual.valor += Math.abs(Number(l.amount) || 0)
        mapa.set(tipo, atual)
    }
    return [...mapa.values()].sort((a, b) => b.valor - a.valor)
}

/** Agrupa por dia, para enxergar o ritmo de entrada e saída. */
function porDia(jid, dias = 14) {
    const linhas = razao(jid, { limite: 1000, dias })
    const mapa = new Map()
    for (const l of linhas) {
        const dia = String(l.created_at || '').slice(0, 10)
        const atual = mapa.get(dia) || { dia, entradas: 0, saidas: 0 }
        const valor = Math.abs(Number(l.amount) || 0)
        if (ehEntrada(l)) atual.entradas += valor
        else atual.saidas += valor
        mapa.set(dia, atual)
    }
    return [...mapa.values()].sort((a, b) => a.dia.localeCompare(b.dia))
}

/** Resume o fluxo de um período: entrou, saiu, sobrou. */
function fluxo(jid, dias = 30) {
    const linhas = razao(jid, { limite: 1000, dias })
    let entrou = 0, saiu = 0
    for (const l of linhas) {
        const valor = Math.abs(Number(l.amount) || 0)
        if (ehEntrada(l)) entrou += valor
        else saiu += valor
    }
    return {
        dias,
        movimentacoes: linhas.length,
        entrou,
        saiu,
        saldo: entrou - saiu,
        mediaDiariaGasta: dias ? saiu / dias : 0,
        taxaDePoupanca: entrou ? ((entrou - saiu) / entrou) * 100 : 0
    }
}

/** Com quem o jogador mais transaciona. */
function parceiros(jid, limite = 10) {
    const linhas = razao(jid, { limite: 500 })
    const mapa = new Map()
    for (const l of linhas) {
        if (!l.target_jid || l.target_jid === jid) continue
        const atual = mapa.get(l.target_jid) || { jid: l.target_jid, quantidade: 0, valor: 0 }
        atual.quantidade++
        atual.valor += Math.abs(Number(l.amount) || 0)
        mapa.set(l.target_jid, atual)
    }
    return [...mapa.values()].sort((a, b) => b.valor - a.valor).slice(0, limite)
}

// ══════════════════════════════════════════════════════════════
// CÁLCULOS
// ══════════════════════════════════════════════════════════════

/** Juros compostos: quanto um valor vira depois de N dias. */
function jurosCompostos(principal, dias, taxaDiaria = RENDIMENTO_DIARIO) {
    const p = Math.max(0, Number(principal) || 0)
    const d = Math.max(0, Math.floor(Number(dias) || 0))
    const montante = p * Math.pow(1 + taxaDiaria, d)
    return { principal: p, dias: d, taxaDiaria, montante, rendimento: montante - p }
}

/** Em quantos dias um valor atinge a meta, rendendo sozinho. */
function diasAteMeta(atual, meta, taxaDiaria = RENDIMENTO_DIARIO) {
    const a = Math.max(0, Number(atual) || 0)
    const m = Math.max(0, Number(meta) || 0)
    if (m <= a) return { alcancado: true, dias: 0, falta: 0 }
    if (a <= 0 || taxaDiaria <= 0) return { alcancado: false, dias: null, falta: m - a }
    const dias = Math.ceil(Math.log(m / a) / Math.log(1 + taxaDiaria))
    return { alcancado: false, dias, falta: m - a }
}

/** Simula um empréstimo em parcelas iguais. */
function simularEmprestimo(valor, parcelas, taxa = TARIFAS.emprestimo) {
    const v = Math.max(0, Number(valor) || 0)
    const n = Math.max(1, Math.floor(Number(parcelas) || 1))
    const total = v * (1 + taxa)
    return { valor: v, parcelas: n, taxa, total, porParcela: total / n, juros: total - v }
}

/** Quanto tempo o saldo dura no ritmo de gasto atual. */
function autonomia(user, jid) {
    const p = patrimonio(user)
    const f = fluxo(jid, 30)
    if (f.mediaDiariaGasta <= 0) return { dias: null, motivo: 'sem gastos registrados nos últimos 30 dias' }
    return { dias: Math.floor(p.total / f.mediaDiariaGasta), gastoDiario: f.mediaDiariaGasta, total: p.total }
}

// ══════════════════════════════════════════════════════════════
// COMPARAÇÃO
// ══════════════════════════════════════════════════════════════

/** Estatísticas de patrimônio entre os registrados, para comparação. */
function estatisticasGerais() {
    try {
        return q(`SELECT
                COUNT(*) AS jogadores,
                AVG(COALESCE(coins,0) + COALESCE(bank,0) + COALESCE(vault_coins,0)) AS media,
                MAX(COALESCE(coins,0) + COALESCE(bank,0) + COALESCE(vault_coins,0)) AS maior,
                MIN(COALESCE(coins,0) + COALESCE(bank,0) + COALESCE(vault_coins,0)) AS menor
            FROM users WHERE registered = 1`).get()
    } catch (err) {
        logger.warn(`[BANCO] Estatísticas gerais falharam: ${err.message}`)
        return null
    }
}

/** Em que percentil de riqueza o jogador está. */
function percentil(total) {
    try {
        const r = q(`SELECT
                COUNT(*) AS abaixo,
                (SELECT COUNT(*) FROM users WHERE registered = 1) AS todos
            FROM users
            WHERE registered = 1
              AND (COALESCE(coins,0) + COALESCE(bank,0) + COALESCE(vault_coins,0)) < ?`).get(Number(total) || 0)
        if (!r?.todos) return null
        return { percentil: (r.abaixo / r.todos) * 100, abaixo: r.abaixo, todos: r.todos }
    } catch (err) {
        logger.warn(`[BANCO] Percentil falhou: ${err.message}`)
        return null
    }
}

// ══════════════════════════════════════════════════════════════
// PREFERÊNCIAS DA CONTA
// ══════════════════════════════════════════════════════════════

/**
 * Lê e grava preferências da conta.
 *
 * Vão para a coluna `extra` do usuário, que já guarda por padrão qualquer campo
 * sem coluna própria — não precisa de tabela nova para meia dúzia de opções.
 */
function lerPreferencias(user) {
    return {
        meta: Number(user?.bancoMeta) || 0,
        apelido: user?.bancoApelido || null,
        automatico: Number(user?.bancoAutomatico) || 0,
        trancadoAte: Number(user?.bancoTrancadoAte) || 0,
        limiteDiario: Number(user?.bancoLimiteDiario) || 0
    }
}

function salvarPreferencia(user, chave, valor) {
    const permitidas = new Set(['bancoMeta', 'bancoApelido', 'bancoAutomatico', 'bancoTrancadoAte', 'bancoLimiteDiario'])
    if (!permitidas.has(chave)) {
        logger.warn(`[BANCO] Preferência "${chave}" não permitida — ignorada.`)
        return false
    }
    user[chave] = valor
    dataService.saveUser(user)
    return true
}

module.exports = {
    RENDIMENTO_DIARIO,
    TARIFAS,
    moeda,
    patrimonio,
    razao,
    ehEntrada,
    porTipo,
    porDia,
    fluxo,
    parceiros,
    jurosCompostos,
    diasAteMeta,
    simularEmprestimo,
    autonomia,
    estatisticasGerais,
    percentil,
    lerPreferencias,
    salvarPreferencia
}
