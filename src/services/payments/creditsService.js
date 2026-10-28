/**
 * Carteira de créditos do aluguel (dinheiro REAL, não as moedas do RPG).
 *
 * Separação importante: `coins` é a economia de brincadeira do grupo; crédito
 * aqui vale dinheiro que alguém pagou. Misturar os dois deixaria o `.roubar`
 * ou uma aposta de cassino drenar o saldo pago — por isso vive em outra
 * estrutura, com outro histórico.
 *
 * Onde fica: na tabela `config`, chave `__creditos__`, através do configRepo.
 * O ledger guarda cada movimento — sem ele, uma contestação de cobrança não
 * teria como ser auditada.
 */

const configRepo = require('../../database/repositories/configRepository')
const logger = require('../../core/logger')

const CHAVE = '__creditos__'
const CHAVE_LEDGER = '__creditos_ledger__'
const CHAVE_PROCESSADOS = '__stripe_eventos__'

// Quantos créditos vale 1 unidade da moeda (R$ 1,00 = 1 crédito por padrão).
const CREDITOS_POR_UNIDADE = Number(process.env.CREDITOS_POR_REAL || 1)

// Quantos créditos custa 1 dia de aluguel.
const CREDITOS_POR_DIA = Number(process.env.CREDITOS_POR_DIA_ALUGUEL || 5)

// Ledger não cresce para sempre: guardamos os movimentos recentes.
const LEDGER_MAX = Number(process.env.CREDITOS_LEDGER_MAX || 500)

function _ler(chave, padrao) {
    const v = configRepo.getConfig(chave)
    return (v && typeof v === 'object') ? v : padrao
}

function _gravar(chave, valor) {
    configRepo.saveConfig(chave, valor)
}

/** Saldo de créditos de um usuário. */
function saldo(jid) {
    const todos = _ler(CHAVE, {})
    return Number(todos[jid]?.creditos || 0)
}

function perfil(jid) {
    const todos = _ler(CHAVE, {})
    const p = todos[jid] || {}
    return {
        jid,
        creditos: Number(p.creditos || 0),
        totalPago: Number(p.totalPago || 0),      // em centavos, acumulado
        moeda: p.moeda || 'brl',
        primeiraCompra: p.primeiraCompra || null,
        ultimaCompra: p.ultimaCompra || null,
        email: p.email || null
    }
}

/** Converte centavos pagos em créditos. */
function centavosParaCreditos(centavos) {
    return Math.floor((Number(centavos) / 100) * CREDITOS_POR_UNIDADE)
}

function creditosParaDias(creditos) {
    return Math.floor(Number(creditos) / CREDITOS_POR_DIA)
}

function _registrarLedger(mov) {
    const ledger = _ler(CHAVE_LEDGER, { movimentos: [] })
    if (!Array.isArray(ledger.movimentos)) ledger.movimentos = []
    ledger.movimentos.unshift({ ...mov, em: Date.now() })
    if (ledger.movimentos.length > LEDGER_MAX) ledger.movimentos.length = LEDGER_MAX
    _gravar(CHAVE_LEDGER, ledger)
}

/**
 * Um evento do Stripe já foi processado?
 *
 * O Stripe REENVIA webhooks quando não recebe 200 — é o comportamento correto
 * dele. Sem essa checagem, uma resposta lenta faria o mesmo pagamento creditar
 * duas, três vezes.
 */
function eventoJaProcessado(eventId) {
    const p = _ler(CHAVE_PROCESSADOS, { ids: [] })
    return Array.isArray(p.ids) && p.ids.includes(eventId)
}

function marcarEventoProcessado(eventId) {
    const p = _ler(CHAVE_PROCESSADOS, { ids: [] })
    if (!Array.isArray(p.ids)) p.ids = []
    p.ids.unshift(eventId)
    if (p.ids.length > 1000) p.ids.length = 1000
    _gravar(CHAVE_PROCESSADOS, p)
}

/**
 * Credita após um pagamento confirmado.
 * @returns {{ok:boolean, creditos:number, saldo:number, jaProcessado?:boolean}}
 */
function creditarPagamento({ jid, centavos, moeda = 'brl', eventId, sessionId, email = null }) {
    if (eventId && eventoJaProcessado(eventId)) {
        logger.info(`[CREDITOS] Evento ${eventId} já processado — ignorando reenvio`)
        return { ok: true, jaProcessado: true, creditos: 0, saldo: saldo(jid) }
    }

    const creditos = centavosParaCreditos(centavos)
    const todos = _ler(CHAVE, {})
    const atual = todos[jid] || {}

    todos[jid] = {
        creditos: Number(atual.creditos || 0) + creditos,
        totalPago: Number(atual.totalPago || 0) + Number(centavos || 0),
        moeda,
        primeiraCompra: atual.primeiraCompra || Date.now(),
        ultimaCompra: Date.now(),
        email: email || atual.email || null
    }
    _gravar(CHAVE, todos)

    _registrarLedger({ tipo: 'compra', jid, creditos, centavos, moeda, eventId, sessionId })
    if (eventId) marcarEventoProcessado(eventId)

    logger.info(`[CREDITOS] +${creditos} para ${jid} (${centavos} ${moeda}) — saldo ${todos[jid].creditos}`)
    return { ok: true, creditos, saldo: todos[jid].creditos }
}

/**
 * Gasta créditos (ex.: reativar aluguel).
 * @returns {{ok:boolean, erro?:string, saldo?:number}}
 */
function gastar({ jid, creditos, motivo = 'uso' }) {
    const quantia = Math.floor(Number(creditos) || 0)
    if (quantia <= 0) return { ok: false, erro: 'Quantidade inválida.' }

    const todos = _ler(CHAVE, {})
    const atual = Number(todos[jid]?.creditos || 0)
    if (atual < quantia) {
        return { ok: false, erro: `Créditos insuficientes: você tem ${atual}, precisa de ${quantia}.` }
    }

    todos[jid] = { ...(todos[jid] || {}), creditos: atual - quantia }
    _gravar(CHAVE, todos)
    _registrarLedger({ tipo: 'gasto', jid, creditos: -quantia, motivo })

    logger.info(`[CREDITOS] -${quantia} de ${jid} (${motivo}) — saldo ${atual - quantia}`)
    return { ok: true, saldo: atual - quantia }
}

/** Ajuste manual do dono (estorno, cortesia, correção). */
function ajustar({ jid, creditos, motivo = 'ajuste manual' }) {
    const todos = _ler(CHAVE, {})
    const atual = Number(todos[jid]?.creditos || 0)
    const novo = Math.max(0, atual + Math.floor(Number(creditos) || 0))
    todos[jid] = { ...(todos[jid] || {}), creditos: novo }
    _gravar(CHAVE, todos)
    _registrarLedger({ tipo: 'ajuste', jid, creditos: novo - atual, motivo })
    return { ok: true, saldo: novo }
}

function extrato(jid, limite = 10) {
    const ledger = _ler(CHAVE_LEDGER, { movimentos: [] })
    const movs = Array.isArray(ledger.movimentos) ? ledger.movimentos : []
    return (jid ? movs.filter(m => m.jid === jid) : movs).slice(0, limite)
}

function todosOsPerfis() {
    const todos = _ler(CHAVE, {})
    return Object.entries(todos)
        .map(([jid, p]) => ({ jid, ...p, creditos: Number(p?.creditos || 0) }))
        .sort((a, b) => b.creditos - a.creditos)
}

module.exports = {
    saldo,
    perfil,
    creditarPagamento,
    gastar,
    ajustar,
    extrato,
    todosOsPerfis,
    centavosParaCreditos,
    creditosParaDias,
    eventoJaProcessado,
    marcarEventoProcessado,
    CREDITOS_POR_UNIDADE,
    CREDITOS_POR_DIA
}
