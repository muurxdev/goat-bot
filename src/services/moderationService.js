/**
 * Guarda Central — leitura e registro das ações de moderação.
 *
 * O que já existia era espalhado: `warns` guarda só uma contagem solta por
 * pessoa (sem grupo, sem motivo, sem quando), `muted_members` guarda os
 * silenciamentos, `blacklist` e `trust_list` guardam listas. Nada disso
 * respondia "o que aconteceu com esse membro?".
 *
 * Este serviço junta as três fontes e acrescenta um livro de ocorrências por
 * grupo, guardado em `profile_data` — chave/valor genérico que já existe, sem
 * precisar de migração de banco para começar a registrar histórico.
 */

const { q } = require('../database/connection')
const perfilData = require('./profileDataService')
const logger = require('../core/logger')

/** Quantas ocorrências ficam guardadas por grupo. */
const TETO_OCORRENCIAS = 300

const CHAVE_LIVRO = 'moderacao_ocorrencias'
const CHAVE_CONFIG = 'moderacao_config'

const CONFIG_PADRAO = {
    limiteAdvertencias: 3,
    punicaoNoLimite: 'silenciar',
    tempoSilencioMin: 60,
    isentos: []
}

/** Motivos padronizados: evita cada admin escrever o mesmo de um jeito. */
const MOTIVOS = {
    spam: 'Divulgação ou mensagens repetidas',
    ofensa: 'Ofensa a outro membro',
    link: 'Link proibido',
    flood: 'Excesso de mensagens em sequência',
    conteudo: 'Conteúdo impróprio',
    regras: 'Descumprimento das regras do grupo',
    nome: 'Nome ou foto inadequados',
    outro: 'Outro motivo'
}

function agora() { return Date.now() }

function nomeCurto(jid) {
    return '+' + String(jid || '').split('@')[0].slice(0, 6) + '****'
}

// ══════════════════════════════════════════════════════════════
// LIVRO DE OCORRÊNCIAS
// ══════════════════════════════════════════════════════════════

/** Lê o livro de ocorrências de um grupo. */
function livro(grupoJid) {
    try {
        const bruto = perfilData.getData(grupoJid, CHAVE_LIVRO, '[]')
        const dados = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        return Array.isArray(dados) ? dados : []
    } catch (err) {
        logger.warn(`[MOD] Livro de ${grupoJid} ilegível: ${err.message} — tratando como vazio.`)
        return []
    }
}

/**
 * Registra uma ocorrência.
 *
 * O livro é cortado no teto para não crescer sem limite: um grupo movimentado
 * geraria milhares de linhas num campo de texto só.
 */
function registrar(grupoJid, { alvo, autor, acao, motivo = '', detalhe = '' }) {
    try {
        const atual = livro(grupoJid)
        atual.unshift({ em: agora(), alvo, autor, acao, motivo, detalhe })
        perfilData.setData(grupoJid, CHAVE_LIVRO, JSON.stringify(atual.slice(0, TETO_OCORRENCIAS)))
        return true
    } catch (err) {
        logger.error(`[MOD] Falha ao registrar ocorrência em ${grupoJid}: ${err.message}`)
        return false
    }
}

/** Ocorrências de um membro específico. */
function historicoDe(grupoJid, alvoJid) {
    const alvo = String(alvoJid || '').split('@')[0]
    return livro(grupoJid).filter(o => String(o.alvo || '').split('@')[0] === alvo)
}

/** Ocorrências agrupadas por membro, ordenadas por quantidade. */
function reincidentes(grupoJid, limite = 10) {
    const mapa = new Map()
    for (const o of livro(grupoJid)) {
        if (!o.alvo) continue
        const atual = mapa.get(o.alvo) || { alvo: o.alvo, total: 0, ultima: 0, acoes: new Set() }
        atual.total++
        atual.ultima = Math.max(atual.ultima, Number(o.em) || 0)
        atual.acoes.add(o.acao)
        mapa.set(o.alvo, atual)
    }
    return [...mapa.values()]
        .map(x => ({ ...x, acoes: [...x.acoes] }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limite)
}

/** Contagem por tipo de ação num período. */
function porAcao(grupoJid, dias = 30) {
    const corte = agora() - dias * 86400000
    const mapa = new Map()
    for (const o of livro(grupoJid)) {
        if ((Number(o.em) || 0) < corte) continue
        mapa.set(o.acao, (mapa.get(o.acao) || 0) + 1)
    }
    return [...mapa].map(([acao, total]) => ({ acao, total })).sort((a, b) => b.total - a.total)
}

/** Contagem por motivo num período. */
function porMotivo(grupoJid, dias = 30) {
    const corte = agora() - dias * 86400000
    const mapa = new Map()
    for (const o of livro(grupoJid)) {
        if ((Number(o.em) || 0) < corte) continue
        const m = o.motivo || 'não informado'
        mapa.set(m, (mapa.get(m) || 0) + 1)
    }
    return [...mapa].map(([motivo, total]) => ({ motivo, total })).sort((a, b) => b.total - a.total)
}

// ══════════════════════════════════════════════════════════════
// FONTES EXISTENTES
// ══════════════════════════════════════════════════════════════

/** Advertências acumuladas (tabela `warns`). */
function advertencias(jid) {
    try {
        const r = q('SELECT count FROM warns WHERE jid = ?').get(jid)
        return Number(r?.count) || 0
    } catch (err) {
        logger.warn(`[MOD] Advertências de ${jid} falharam: ${err.message}`)
        return 0
    }
}

function topAdvertidos(limite = 10) {
    try {
        return q('SELECT jid, count FROM warns WHERE count > 0 ORDER BY count DESC LIMIT ?').all(limite)
    } catch (err) {
        logger.warn(`[MOD] Ranking de advertências falhou: ${err.message}`)
        return []
    }
}

/** Silenciamentos ativos de um grupo, com tempo restante. */
function silenciadosAtivos(grupoJid) {
    try {
        const linhas = q('SELECT * FROM muted_members WHERE group_jid = ?').all(grupoJid)
        const agoraMs = agora()
        return linhas
            .map(l => {
                const expira = Number(l.expires_at) || 0
                return { ...l, expira, restanteMs: expira ? expira - agoraMs : null }
            })
            .filter(l => l.restanteMs === null || l.restanteMs > 0)
    } catch (err) {
        logger.warn(`[MOD] Silenciados de ${grupoJid} falharam: ${err.message}`)
        return []
    }
}

/** Silenciamentos já vencidos que continuam na tabela. */
function silenciadosVencidos(grupoJid) {
    try {
        const agoraMs = agora()
        return q('SELECT * FROM muted_members WHERE group_jid = ?').all(grupoJid)
            .filter(l => Number(l.expires_at) > 0 && Number(l.expires_at) <= agoraMs)
    } catch (err) {
        logger.warn(`[MOD] Silenciados vencidos de ${grupoJid} falharam: ${err.message}`)
        return []
    }
}

function naListaNegra(jid) {
    try {
        return !!q('SELECT jid FROM blacklist WHERE jid = ?').get(jid)
    } catch (err) {
        logger.warn(`[MOD] Consulta à lista negra falhou: ${err.message}`)
        return false
    }
}

function ehConfiavel(jid) {
    try {
        return !!q('SELECT jid FROM trust_list WHERE jid = ?').get(jid)
    } catch (err) {
        logger.warn(`[MOD] Consulta à lista de confiança falhou: ${err.message}`)
        return false
    }
}

function cargoDe(jid) {
    try {
        return q('SELECT role FROM user_roles WHERE jid = ?').get(jid)?.role || null
    } catch (err) {
        logger.warn(`[MOD] Cargo de ${jid} falhou: ${err.message}`)
        return null
    }
}

/** Ficha consolidada de um membro. */
function ficha(grupoJid, jid) {
    const hist = historicoDe(grupoJid, jid)
    const silenciado = silenciadosAtivos(grupoJid).find(s => String(s.user_jid).split('@')[0] === String(jid).split('@')[0])
    return {
        jid,
        advertencias: advertencias(jid),
        ocorrencias: hist.length,
        ultimaOcorrencia: hist[0] || null,
        silenciado: !!silenciado,
        silenciadoAte: silenciado?.expira || null,
        listaNegra: naListaNegra(jid),
        confiavel: ehConfiavel(jid),
        cargo: cargoDe(jid)
    }
}

// ══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO POR GRUPO
// ══════════════════════════════════════════════════════════════

function config(grupoJid) {
    try {
        const bruto = perfilData.getData(grupoJid, CHAVE_CONFIG, null)
        if (!bruto) return { ...CONFIG_PADRAO }
        const dados = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        return { ...CONFIG_PADRAO, ...dados }
    } catch (err) {
        logger.warn(`[MOD] Configuração de ${grupoJid} ilegível: ${err.message} — usando o padrão.`)
        return { ...CONFIG_PADRAO }
    }
}

function salvarConfig(grupoJid, alteracoes) {
    const permitidas = new Set(Object.keys(CONFIG_PADRAO))
    const atual = config(grupoJid)
    for (const [k, v] of Object.entries(alteracoes || {})) {
        if (!permitidas.has(k)) {
            logger.warn(`[MOD] Opção "${k}" não existe na moderação — ignorada.`)
            continue
        }
        atual[k] = v
    }
    perfilData.setData(grupoJid, CHAVE_CONFIG, JSON.stringify(atual))
    return atual
}

/** Escalada sugerida conforme o número de advertências. */
function escaladaSugerida(grupoJid, quantidade) {
    const c = config(grupoJid)
    const n = Number(quantidade) || 0
    if (n === 0) return { nivel: 'limpo', acao: 'nenhuma', texto: 'Sem advertências.' }
    if (n < c.limiteAdvertencias - 1) return { nivel: 'aviso', acao: 'advertir', texto: 'Ainda em fase de aviso.' }
    if (n < c.limiteAdvertencias) return { nivel: 'atencao', acao: 'advertir', texto: 'Última advertência antes da punição.' }
    return { nivel: 'limite', acao: c.punicaoNoLimite, texto: 'Limite atingido — cabe ' + c.punicaoNoLimite + '.' }
}

function duracao(ms) {
    const s = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    if (d) return `${d}d ${h}h`
    if (h) return `${h}h ${m}min`
    return `${m}min`
}

module.exports = {
    MOTIVOS,
    CONFIG_PADRAO,
    TETO_OCORRENCIAS,
    nomeCurto,
    duracao,
    livro,
    registrar,
    historicoDe,
    reincidentes,
    porAcao,
    porMotivo,
    advertencias,
    topAdvertidos,
    silenciadosAtivos,
    silenciadosVencidos,
    naListaNegra,
    ehConfiavel,
    cargoDe,
    ficha,
    config,
    salvarConfig,
    escaladaSugerida
}
