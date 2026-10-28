/**
 * Dados ISOLADOS POR PERFIL — um banco só, sem fragmentar o jogador.
 *
 * A alternativa seria um .sqlite por perfil, mas `users` (level, xp, coins,
 * forja, pet) é compartilhada por todos os perfis, e perfil é definido POR
 * GRUPO: a mesma pessoa pode estar num grupo em `rpg` e noutro em `completo`.
 * Com bancos separados ela teria 4 progressões diferentes e o ranking racharia.
 *
 * Então a identidade fica única e o que varia por perfil mora aqui, chaveado
 * por (perfil, ambiente, chave) na tabela `profile_data`.
 *
 * Uso típico:
 *   setData(scope, 'sugestoes', [...])   // grava no perfil ATIVO daquele ambiente
 *   getData(scope, 'sugestoes', [])
 */

const { q } = require('../database/connection')
const botProfile = require('./botProfileService')
const logger = require('../core/logger')

/** Perfil usado quando o ambiente ainda não tem nenhum ativo. */
const PERFIL_PADRAO = 'completo'

/**
 * Perfil efetivo de um ambiente.
 * @param {string} scope
 * @returns {string} chave do perfil ativo, ou PERFIL_PADRAO
 */
function perfilDe(scope) {
    const ativo = botProfile.getActiveProfile(scope)
    return ativo ? ativo.key : PERFIL_PADRAO
}

/**
 * Lê um dado do perfil ativo naquele ambiente.
 * @param {string} scope ambiente (JID do grupo, 'pv' ou 'global')
 * @param {string} chave
 * @param {*} [fallback] valor devolvido quando não existe
 * @param {string} [profile] força um perfil específico
 */
function getData(scope, chave, fallback = null, profile = null) {
    const perfil = profile || perfilDe(scope)
    try {
        const row = q('SELECT valor FROM profile_data WHERE profile = ? AND scope = ? AND chave = ?')
            .get(perfil, scope, chave)
        if (!row || row.valor == null) return fallback
        return JSON.parse(row.valor)
    } catch (err) {
        logger.warn(`[PROFILE DATA] Falha ao ler ${perfil}/${scope}/${chave}: ${err.message}`)
        return fallback
    }
}

/**
 * Grava um dado no perfil ativo naquele ambiente.
 * @returns {boolean} true quando gravou
 */
function setData(scope, chave, valor, profile = null) {
    const perfil = profile || perfilDe(scope)
    try {
        q(`INSERT INTO profile_data (profile, scope, chave, valor, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(profile, scope, chave)
           DO UPDATE SET valor = excluded.valor, updated_at = CURRENT_TIMESTAMP`)
            .run(perfil, scope, chave, JSON.stringify(valor))
        return true
    } catch (err) {
        logger.error(`[PROFILE DATA] Falha ao gravar ${perfil}/${scope}/${chave}: ${err.message}`)
        return false
    }
}

/** Remove um dado do perfil ativo naquele ambiente. */
function deleteData(scope, chave, profile = null) {
    const perfil = profile || perfilDe(scope)
    try {
        const r = q('DELETE FROM profile_data WHERE profile = ? AND scope = ? AND chave = ?')
            .run(perfil, scope, chave)
        return r.changes > 0
    } catch (err) {
        logger.error(`[PROFILE DATA] Falha ao remover ${perfil}/${scope}/${chave}: ${err.message}`)
        return false
    }
}

/** Todas as chaves gravadas para um perfil+ambiente. */
function listKeys(scope, profile = null) {
    const perfil = profile || perfilDe(scope)
    try {
        return q('SELECT chave, updated_at FROM profile_data WHERE profile = ? AND scope = ? ORDER BY chave')
            .all(perfil, scope)
    } catch (err) {
        logger.warn(`[PROFILE DATA] Falha ao listar ${perfil}/${scope}: ${err.message}`)
        return []
    }
}

/**
 * Lê a mesma chave em TODOS os ambientes de um perfil.
 * Serve para visões agregadas (ex.: todas as sugestões recebidas no perfil).
 */
function collectAcrossScopes(profile, chave) {
    try {
        const rows = q('SELECT scope, valor FROM profile_data WHERE profile = ? AND chave = ?')
            .all(profile, chave)
        return rows.map(r => {
            try {
                return { scope: r.scope, valor: JSON.parse(r.valor) }
            } catch (err) {
                logger.warn(`[PROFILE DATA] JSON inválido em ${profile}/${r.scope}/${chave}: ${err.message}`)
                return { scope: r.scope, valor: null }
            }
        })
    } catch (err) {
        logger.warn(`[PROFILE DATA] Falha ao agregar ${profile}/${chave}: ${err.message}`)
        return []
    }
}

module.exports = {
    PERFIL_PADRAO,
    perfilDe,
    getData,
    setData,
    deleteData,
    listKeys,
    collectAcrossScopes
}
