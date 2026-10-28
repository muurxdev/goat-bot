/**
 * Perfis de atuação do bot — camada acima do `moduleStateService`.
 *
 * Guarda QUAL perfil está ativo em cada ambiente e aplica o preset de módulos
 * correspondente. O estado de módulo continua sendo a fonte da verdade para o
 * gate de comandos; aqui só registramos a intenção, para poder exibir e trocar.
 *
 * Persistido em `configs`, linha `__bot_profiles__`:
 *   { scopes: { "<jid|pv|global>": "rpg" } }
 *
 * Aplicar um perfil SEMPRE zera o ambiente antes de acender os módulos dele,
 * senão trocar de perfil deixaria ligado o que o perfil anterior tinha aceso.
 */

const configRepo = require('../database/repositories/configRepository')
const moduleState = require('./moduleStateService')
const { PROFILES, PROFILE_BY_KEY } = require('../config/botProfiles')
const logger = require('../core/logger')

const STATE_KEY = '__bot_profiles__'
const TTL_MS = 4000

let _cache = null
let _at = 0

function _load() {
    if (_cache && Date.now() - _at < TTL_MS) return _cache
    let state = { scopes: {} }
    try {
        const cfg = configRepo.getConfig(STATE_KEY)
        if (cfg && typeof cfg === 'object' && cfg.scopes && typeof cfg.scopes === 'object') {
            state.scopes = cfg.scopes
        }
    } catch (e) {
        logger.warn(`[BOT PROFILE] Falha ao ler perfis (${e.message}); assumindo nenhum ativo.`)
    }
    _cache = state
    _at = Date.now()
    return state
}

function _save(state) {
    try {
        configRepo.saveConfig(STATE_KEY, state)
        _cache = state
        _at = Date.now()
        return true
    } catch (e) {
        logger.error(`[BOT PROFILE] Falha ao salvar perfis: ${e.message}`)
        return false
    }
}

function invalidateCache() {
    _cache = null
    _at = 0
}

/**
 * Perfil ativo em um ambiente.
 * @param {string} scope
 * @returns {object|null} objeto do perfil, ou null se nenhum
 */
function getActiveProfile(scope) {
    const key = _load().scopes[scope]
    return key ? (PROFILE_BY_KEY[key] || null) : null
}

/**
 * Aplica um perfil: zera o ambiente e acende só os módulos do preset.
 * @param {string} key chave canônica do perfil
 * @param {string} scope
 * @returns {{ok:boolean, reason?:string, perfil?:object, ligados?:string[]}}
 */
function applyProfile(key, scope) {
    const perfil = PROFILE_BY_KEY[key]
    if (!perfil) return { ok: false, reason: `Perfil "${key}" não existe.` }

    // Zera antes de acender: sem isto, trocar de perfil acumularia módulos.
    moduleState.disableAll(scope)

    const ligados = []
    for (const mod of perfil.modules) {
        const res = moduleState.setModule(mod, true, scope)
        if (res.ok) ligados.push(mod)
        else logger.warn(`[BOT PROFILE] Perfil "${key}" cita módulo inválido "${mod}": ${res.reason}`)
    }

    // Se o perfil for divulgação, o módulo moderação e anti-link ligam juntos obrigatoriamente
    if (key === 'divulgacao') {
        const resMod = moduleState.setModule('moderacao', true, scope)
        if (resMod.ok && !ligados.includes('moderacao')) ligados.push('moderacao')

        if (scope.endsWith('@g.us')) {
            try {
                const currentCfg = configRepo.getConfig(scope) || {}
                currentCfg.antilink = true
                if (!currentCfg.antilinkConfig) {
                    currentCfg.antilinkConfig = {
                        enabled: true,
                        action: 'ban',
                        platforms: { whatsapp: true, canal: true, telegram: true }
                    }
                } else {
                    currentCfg.antilinkConfig.enabled = true
                }
                configRepo.saveConfig(scope, currentCfg)
                logger.info(`[BOT PROFILE] Anti-link e Moderação ativados automaticamente para o perfil Divulgação em ${scope}`)
            } catch (errCfg) {
                logger.warn(`[BOT PROFILE] Falha ao ligar antilink para divulgação em ${scope}: ${errCfg.message}`)
            }
        }
    }

    const state = _load()
    state.scopes[scope] = key
    _save(state)
    moduleState.invalidateCache()

    logger.info(`[BOT PROFILE] Perfil "${key}" aplicado em ${scope} (${ligados.length} módulos).`)
    return { ok: true, perfil, ligados }
}

/**
 * Desativa o perfil do ambiente e desliga todos os módulos dele.
 * @param {string} scope
 * @returns {{ok:boolean, anterior:object|null}}
 */
function clearProfile(scope) {
    const anterior = getActiveProfile(scope)
    moduleState.disableAll(scope)

    const state = _load()
    delete state.scopes[scope]
    _save(state)
    moduleState.invalidateCache()

    logger.info(`[BOT PROFILE] Perfil desativado em ${scope}.`)
    return { ok: true, anterior }
}

/**
 * Lista os perfis, marcando qual está ativo no ambiente.
 * @param {string} scope
 */
function listProfiles(scope) {
    const ativo = _load().scopes[scope] || null
    return PROFILES.map(p => ({ ...p, active: p.key === ativo }))
}

module.exports = {
    STATE_KEY,
    getActiveProfile,
    applyProfile,
    clearProfile,
    listProfiles,
    invalidateCache
}
