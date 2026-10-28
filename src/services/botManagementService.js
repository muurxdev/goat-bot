/**
 * Gestão do bot — o que o dono precisa ver para tomar decisão.
 *
 * O painel que existia mostrava número de comandos e tempo no ar. As perguntas
 * que realmente aparecem são outras: quais grupos estão mudos, quais aluguéis
 * vencem esta semana, quantos usuários estão travados sem cadastro, que
 * ambiente ficou sem configuração. Este serviço responde essas, lendo as
 * tabelas que já existem.
 *
 * Só leitura: nada aqui altera estado. Alterar continua sendo trabalho dos
 * comandos específicos, que têm as próprias confirmações.
 */

const { q } = require('../database/connection')
const logger = require('../core/logger')

function seguro(nome, fn, padrao = null) {
    try {
        return fn()
    } catch (err) {
        logger.warn(`[GESTAO] ${nome} falhou: ${err.message}`)
        return padrao
    }
}

function numeroDe(jid) {
    return String(jid || '').split('@')[0].split(':')[0]
}

function nomeCurto(jid) {
    return '+' + numeroDe(jid).slice(0, 6) + 'xxxx'
}

function duracao(ms) {
    const s = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600)
    if (d) return `${d}d ${h}h`
    if (h) return `${h}h`
    return `${Math.floor(s / 60)}min`
}

// ══════════════════════════════════════════════════════════════
// AMBIENTES
// ══════════════════════════════════════════════════════════════

/**
 * Tipo do ambiente pela chave da linha em configs. A mesma tabela guarda
 * registros internos (estado de comandos, perfis, créditos, eventos Stripe),
 * que não são grupo nem privado e por isso não contam como ambiente.
 */
function tipoDe(jid) {
    const j = String(jid || '')
    if (j.endsWith('@g.us')) return 'grupo'
    if (j === 'global') return 'global'
    if (j.endsWith('@s.whatsapp.net') || j.endsWith('@lid')) return 'privado'
    return 'interno'
}

/** Ambientes com configuração salva, com o resumo de cada um. */
function ambientes({ incluirInternos = false } = {}) {
    return seguro('ambientes', () => {
        const linhas = q('SELECT group_jid, settings, updated_at FROM configs').all()
            .filter(l => incluirInternos || tipoDe(l.group_jid) !== 'interno')
        return linhas.map(l => {
            let opcoes = {}
            try { opcoes = JSON.parse(l.settings || '{}') } catch (err) {
                logger.warn(`[GESTAO] settings ilegível em ${l.group_jid}: ${err.message}`)
            }
            return {
                jid: l.group_jid,
                tipo: tipoDe(l.group_jid),
                opcoes: Object.keys(opcoes).length,
                chaves: Object.keys(opcoes),
                atualizadoEm: l.updated_at
            }
        })
    }, [])
}

/** Estado dos Domínios por ambiente, lido do estado de comandos. */
function dominiosPorAmbiente() {
    return seguro('dominiosPorAmbiente', () => {
        const ms = require('./moduleStateService')
        if (typeof ms.listModules !== 'function') return []
        return ambientes()
            .filter(a => a.tipo === 'grupo')
            .map(a => {
                const lista = ms.listModules(a.jid) || []
                const ligados = lista.filter(m => m.enabled ?? m.ativo ?? false)
                return { jid: a.jid, total: lista.length, ligados: ligados.length, nomes: ligados.map(m => m.key || m.chave) }
            })
    }, [])
}

/** Perfil de bot ativo em cada ambiente. */
function perfisAtivos() {
    return seguro('perfisAtivos', () => {
        const bp = require('./botProfileService')
        if (typeof bp.getActiveProfile !== 'function') return []
        return ambientes()
            .filter(a => a.tipo === 'grupo')
            .map(a => ({ jid: a.jid, perfil: bp.getActiveProfile(a.jid)?.key || null }))
    }, [])
}

// ══════════════════════════════════════════════════════════════
// ALUGUÉIS
// ══════════════════════════════════════════════════════════════

function alugueis() {
    return seguro('alugueis', () => q('SELECT * FROM rentals ORDER BY expires_at DESC').all().map(r => {
        const expira = Number(r.expires_at) || 0
        const restanteMs = expira ? expira - Date.now() : null
        return {
            ...r,
            expira,
            restanteMs,
            situacao: !r.is_active ? 'inativo' : restanteMs === null ? 'vitalício' : restanteMs > 0 ? 'ativo' : 'vencido'
        }
    }), [])
}

function alugueisPorSituacao() {
    const todos = alugueis()
    const mapa = new Map()
    for (const a of todos) mapa.set(a.situacao, (mapa.get(a.situacao) || 0) + 1)
    return { total: todos.length, porSituacao: [...mapa].map(([situacao, n]) => ({ situacao, n })) }
}

/** Aluguéis que vencem dentro de N dias. */
function alugueisVencendo(dias = 7) {
    const limite = dias * 86400000
    return alugueis().filter(a => a.situacao === 'ativo' && a.restanteMs !== null && a.restanteMs <= limite)
}

// ══════════════════════════════════════════════════════════════
// USUÁRIOS E PERMISSÕES
// ══════════════════════════════════════════════════════════════

function usuarios() {
    return seguro('usuarios', () => q(`SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN registered = 1 THEN 1 ELSE 0 END) AS registrados,
            SUM(CASE WHEN COALESCE(messages,0) > 0 THEN 1 ELSE 0 END) AS comAtividade,
            SUM(CASE WHEN COALESCE(level,0) >= 10 THEN 1 ELSE 0 END) AS acima10,
            SUM(CASE WHEN COALESCE(rpg_enabled,1) = 0 THEN 1 ELSE 0 END) AS rpgDesligado
        FROM users`).get(), {})
}

/** Quem entrou recentemente. */
function novosUsuarios(dias = 7, limite = 15) {
    return seguro('novosUsuarios', () => {
        const corte = Date.now() - dias * 86400000
        return q(`SELECT jid, name, display_nick, registered_at, created_at, level
                  FROM users
                  WHERE COALESCE(registered_at, created_at) IS NOT NULL
                  ORDER BY COALESCE(registered_at, created_at) DESC LIMIT ?`).all(limite)
            .filter(u => new Date(u.registered_at || u.created_at).getTime() >= corte)
    }, [])
}

/**
 * Cadastros da janela de dias, paginados. O novosUsuarios acima corta pelo
 * LIMIT antes de filtrar a data, então não sabe quantos existem e a tela só
 * podia dizer "pode haver mais", sem jeito de ver o resto.
 * @returns {{itens: object[], total: number, paginas: number, pagina: number}}
 */
function novosUsuariosPagina(dias = 7, pagina = 1, porPagina = 15) {
    return seguro('novosUsuariosPagina', () => {
        const corte = Date.now() - dias * 86400000
        const todos = q(`SELECT jid, name, display_nick, registered_at, created_at, level
                  FROM users
                  WHERE COALESCE(registered_at, created_at) IS NOT NULL
                  ORDER BY COALESCE(registered_at, created_at) DESC`).all()
            .filter(u => new Date(u.registered_at || u.created_at).getTime() >= corte)
        const paginas = Math.max(1, Math.ceil(todos.length / porPagina))
        const p = Math.min(paginas, Math.max(1, pagina))
        return { itens: todos.slice((p - 1) * porPagina, p * porPagina), total: todos.length, paginas, pagina: p }
    }, { itens: [], total: 0, paginas: 1, pagina: 1 })
}

/** Quem tem conta mas nunca usou. */
function usuariosParados(limite = 15) {
    return seguro('usuariosParados', () => q(`SELECT jid, name, display_nick, created_at
        FROM users WHERE registered = 1 AND COALESCE(messages,0) = 0 LIMIT ?`).all(limite), [])
}

function cargos() {
    return seguro('cargos', () => q('SELECT * FROM user_roles ORDER BY role').all(), [])
}

function confiaveis() {
    return seguro('confiaveis', () => q('SELECT * FROM trust_list').all(), [])
}

function restricoesPv() {
    return seguro('restricoesPv', () => q('SELECT * FROM dm_restrictions').all(), [])
}

function listaNegra() {
    return seguro('listaNegra', () => q('SELECT * FROM blacklist').all(), [])
}

// ══════════════════════════════════════════════════════════════
// DISTRIBUIÇÕES
// ══════════════════════════════════════════════════════════════

/** Distribuição dos usuários por faixa de nível. */
function faixasDeNivel() {
    return seguro('faixasDeNivel', () => {
        const faixas = [[0, 9], [10, 24], [25, 49], [50, 99], [100, 299], [300, 999], [1000, 999999]]
        return faixas.map(([min, max]) => {
            const r = q('SELECT COUNT(*) AS n FROM users WHERE registered = 1 AND COALESCE(level,0) BETWEEN ? AND ?').get(min, max)
            return { faixa: max >= 999999 ? `${min}+` : `${min}–${max}`, n: r?.n || 0 }
        })
    }, [])
}

/** Ajustes globais do bot. */
function ajustesGlobais() {
    return seguro('ajustesGlobais', () => {
        const linha = q("SELECT settings FROM configs WHERE group_jid = 'global'").get()
        if (!linha) return {}
        const dados = JSON.parse(linha.settings || '{}')
        // Nunca devolver valores de credencial: só se está definido ou não.
        const saida = {}
        for (const [k, v] of Object.entries(dados)) {
            saida[k] = /key|token|secret|senha|pass|cookie|auth|credent|webhook|pix/i.test(k)
                ? (v ? '🔒 definido' : '— vazio')
                : v
        }
        return saida
    }, {})
}

/** Painel consolidado. */
function painel() {
    const u = usuarios()
    const a = alugueisPorSituacao()
    const amb = ambientes()
    return {
        usuarios: u,
        alugueis: a,
        ambientes: amb.length,
        grupos: amb.filter(x => x.tipo === 'grupo').length,
        cargos: cargos().length,
        confiaveis: confiaveis().length,
        bloqueados: listaNegra().length,
        vencendo: alugueisVencendo(7).length
    }
}

module.exports = {
    nomeCurto,
    numeroDe,
    duracao,
    ambientes,
    dominiosPorAmbiente,
    perfisAtivos,
    alugueis,
    alugueisPorSituacao,
    alugueisVencendo,
    usuarios,
    novosUsuarios,
    novosUsuariosPagina,
    usuariosParados,
    cargos,
    confiaveis,
    restricoesPv,
    listaNegra,
    faixasDeNivel,
    ajustesGlobais,
    painel
}
