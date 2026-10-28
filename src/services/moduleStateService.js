/**
 * Estado de ligar/desligar comandos — camada OPT-IN **POR AMBIENTE** (tudo OFF).
 *
 * Cada ambiente (ESCOPO) tem seu próprio estado, para dar isolamento/segurança:
 *   - grupo  → o JID do grupo (ex.: "1203...@g.us"): vale só naquele grupo
 *   - privado→ "pv": vale para as conversas no privado
 *   - global → "global": só usado como padrão explícito do Dono (raro)
 *
 * Assim `.modulo on all` dentro de um grupo libera SÓ aquele grupo; no PV libera
 * só o PV; e `.modulo on <mod> <idDoGrupo>` mira um grupo específico.
 *
 * Duas granularidades dentro do escopo:
 *   - MÓDULO  (cassino, rpg, downloads…) — liga/desliga um bloco
 *   - COMANDO (override) — força ON/OFF um comando, vencendo o módulo
 *
 * Resolução: override do comando > estado do módulo > DEFAULT_ENABLED (=false)
 *
 * Persistido em `configs`, linha `__command_state__`, settings JSON:
 *   { scopes: { "<jid|pv|global>": { modules: {k:bool}, commands: {n:bool} } } }
 * Memoizado (o gate roda no caminho de toda mensagem).
 *
 * IMPORTANTE: camada GLOBAL do DONO. NÃO substitui o toggle por-grupo dos admins
 * (`.categoria`/`.cmd`), que continua valendo por cima.
 */

const configRepo = require('../database/repositories/configRepository')
const { MODULES, BY_KEY, DEFAULT_ENABLED, resolveModuleKey } = require('../config/modules')
const { HIERARCHY_TREES, TODOS_MENOS_DONO, resolveProfileKey } = require('../config/botProfiles')
const logger = require('../core/logger')

const STATE_KEY = '__command_state__'
const TTL_MS = 4000
const PV_SCOPE = 'pv'
const GLOBAL_SCOPE = 'global'

let _cache = null
let _at = 0

/**
 * Resolve a chave de escopo a partir do chat.
 * @param {string} chatJid  JID do chat (grupo ou privado)
 * @param {boolean} [isGroup]
 */
function scopeOf(chatJid, isGroup) {
    if (!chatJid) return PV_SCOPE
    const isG = (typeof isGroup === 'boolean') ? isGroup : String(chatJid).endsWith('@g.us')
    return isG ? String(chatJid) : PV_SCOPE
}

function _load() {
    if (_cache && Date.now() - _at < TTL_MS) return _cache
    let state = { scopes: {} }
    try {
        const cfg = configRepo.getConfig(STATE_KEY)
        if (cfg && typeof cfg === 'object') {
            if (cfg.scopes && typeof cfg.scopes === 'object') {
                state.scopes = cfg.scopes
            } else if (cfg.modules || cfg.commands) {
                // Formato antigo (estado único global) → migra para o escopo global.
                state.scopes[GLOBAL_SCOPE] = { modules: cfg.modules || {}, commands: cfg.commands || {} }
            }
        }
    } catch (e) {
        logger.warn(`[MODULE STATE] Falha ao ler estado (${e.message}); assumindo tudo OFF.`)
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
        logger.error(`[MODULE STATE] Falha ao salvar estado: ${e.message}`)
        return false
    }
}

function _scopeState(scope) {
    const s = _load()
    return s.scopes[scope] || { modules: {}, commands: {} }
}

/**
 * Resolução com FALLBACK para o escopo GLOBAL do Dono.
 *
 * Hierarquia (o primeiro que tiver valor explícito vence):
 *   1. override de comando no escopo específico (grupo/PV)
 *   2. override de comando no escopo GLOBAL
 *   3. estado do módulo no escopo específico
 *   4. estado do módulo no escopo GLOBAL   ← "liberação global" cobre PV + grupos
 *   5. DEFAULT_ENABLED (=false)
 *
 * É isso que faz `.modulo on all global` (ou `.modulo on <mod> global`) liberar de
 * uma vez o PV E todos os grupos — sem deixar de permitir que um grupo/PV específico
 * sobrescreva pontualmente (ex.: desligar cassino só num grupo).
 */

/** @returns {boolean} módulo ligado neste escopo (ou no GLOBAL como fallback)? */
function isModuleEnabled(key, scope = GLOBAL_SCOPE) {
    const st = _scopeState(scope)
    if (typeof st.modules[key] === 'boolean') return st.modules[key]
    if (scope !== GLOBAL_SCOPE) {
        const g = _scopeState(GLOBAL_SCOPE)
        if (typeof g.modules[key] === 'boolean') return g.modules[key]
    }
    return DEFAULT_ENABLED
}

/**
 * @param {object|string} cmd - objeto de comando (preferido) ou nome
 * @param {string} scope - escopo (JID do grupo, 'pv' ou 'global')
 */
function isCommandEnabled(cmd, scope = GLOBAL_SCOPE) {
    const name = (typeof cmd === 'string' ? cmd : (cmd && cmd.name) || '').toLowerCase()
    const st = _scopeState(scope)
    if (name && typeof st.commands[name] === 'boolean') return st.commands[name]
    if (scope !== GLOBAL_SCOPE && name) {
        const g = _scopeState(GLOBAL_SCOPE)
        if (typeof g.commands[name] === 'boolean') return g.commands[name]
    }
    const moduleKey = resolveModuleKey(typeof cmd === 'string' ? { name } : cmd)
    return isModuleEnabled(moduleKey, scope)
}

function _mutate(scope, fn) {
    const state = _load()
    const cur = state.scopes[scope] || { modules: {}, commands: {} }
    const next = fn({ modules: { ...cur.modules }, commands: { ...cur.commands } })
    const scopes = { ...state.scopes, [scope]: next }
    _save({ ...state, scopes })
}

function setModule(key, enabled, scope = GLOBAL_SCOPE) {
    const raw = String(key || '').toLowerCase().trim()
    const resolved = resolveProfileKey(raw) || raw

    if (resolved === 'liberado') {
        if (enabled) return enableLiberado(scope)
        return disableAll(scope)
    }

    if (resolved === 'skycode') {
        const skyChildren = HIERARCHY_TREES.skycode.children
        _mutate(scope, (s) => {
            if (enabled) {
                // Ativa em cascata todos os filhos da árvore Skycode
                for (const child of skyChildren) s.modules[child] = true
                // Isolamento total: Árvore Divulgação NUNCA fica ligada com Skycode
                for (const other of HIERARCHY_TREES.divulgacao.children) s.modules[other] = false
            } else {
                // Desativa todos os filhos da árvore Skycode
                for (const child of skyChildren) s.modules[child] = false
            }
            return s
        })
        return { ok: true, isParent: true, parent: 'skycode', children: skyChildren }
    }

    if (resolved === 'divulgacao') {
        const divChildren = HIERARCHY_TREES.divulgacao.children
        _mutate(scope, (s) => {
            if (enabled) {
                // Ativa em cascata todos os filhos de divulgação (divulgação, moderação, mensagens-grupo)
                for (const child of divChildren) s.modules[child] = true
                // Isolamento total: Divulgação NUNCA liga Skycode
                for (const other of HIERARCHY_TREES.skycode.children) s.modules[other] = false
            } else {
                // Desativa todos os filhos da árvore divulgação
                for (const child of divChildren) s.modules[child] = false
            }
            return s
        })

        // Ativação automática de anti-link no grupo
        if (enabled && scope.endsWith('@g.us')) {
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
            } catch (errCfg) {
                logger.warn(`[MODULE STATE] Falha ao ligar antilink para divulgação em ${scope}: ${errCfg.message}`)
            }
        }

        return { ok: true, isParent: true, parent: 'divulgacao', children: divChildren }
    }

    if (!BY_KEY[raw]) return { ok: false, reason: `Módulo "${raw}" não existe.` }
    _mutate(scope, (s) => { s.modules[raw] = !!enabled; return s })
    return { ok: true, isParent: false }
}

function setCommand(name, enabled, scope = GLOBAL_SCOPE) {
    _mutate(scope, (s) => { s.commands[String(name).toLowerCase()] = !!enabled; return s })
    return { ok: true }
}

/** Remove o override de um comando (volta a seguir o módulo). */
function clearCommand(name, scope = GLOBAL_SCOPE) {
    _mutate(scope, (s) => { delete s.commands[String(name).toLowerCase()]; return s })
    return { ok: true }
}

/** Liga TODOS os módulos comuns — somente no escopo informado.
 * NOTA: Os módulos 'skycode' (dono) e 'divulgacao' (específico) ficam de fora e são ativados sob demanda.
 */
function enableAll(scope = GLOBAL_SCOPE) {
    const modules = {}
    for (const m of MODULES) {
        modules[m.key] = m.key !== 'skycode' && m.key !== 'divulgacao'
    }
    _mutate(scope, () => ({ modules, commands: {} }))
    return { ok: true }
}

/** Liga absolutamente TODOS os módulos (modo Liberado irrestrito). */
function enableLiberado(scope = GLOBAL_SCOPE) {
    const modules = {}
    for (const m of MODULES) {
        modules[m.key] = m.key !== 'owner'
    }
    _mutate(scope, () => ({ modules, commands: {} }))
    return { ok: true, isParent: true, parent: 'liberado', children: TODOS_MENOS_DONO }
}

const HIERARCHY_CLUSTERS = {
    skycode: HIERARCHY_TREES.skycode.children,
    dev: HIERARCHY_TREES.skycode.children,
    livros: HIERARCHY_TREES.skycode.children,
    utilidades: HIERARCHY_TREES.skycode.children,
    escola: HIERARCHY_TREES.skycode.children,
    ferramentas: HIERARCHY_TREES.skycode.children,
    texto: HIERARCHY_TREES.skycode.children,

    divulgacao: HIERARCHY_TREES.divulgacao.children,
    moderacao: HIERARCHY_TREES.divulgacao.children,
    'mensagens-grupo': HIERARCHY_TREES.divulgacao.children,

    liberado: TODOS_MENOS_DONO,
    rpg: ['rpg', 'xp', 'economia', 'perfil'],
    xp: ['xp', 'perfil'],
    cassino: ['cassino', 'economia', 'jogos'],
    economia: ['economia', 'cassino', 'perfil'],
    jogos: ['jogos', 'cassino', 'diversao'],
    diversao: ['diversao', 'jogos', 'figurinhas'],
    downloads: ['downloads', 'utilidades', 'ferramentas'],
    figurinhas: ['figurinhas', 'utilidades'],
    ia: ['ia', 'texto', 'curiosidades'],
    curiosidades: ['curiosidades', 'ia', 'livros'],
    perfil: ['perfil', 'xp', 'economia'],
    owner: ['owner']
}

/**
 * Ativa um módulo e seu ecossistema hierárquico exclusivamente,
 * desligando os outros módulos principais para manter o ambiente limpo.
 * 'skycode' e 'divulgacao' são estritamente isolados entre si.
 */
function enableExclusiveHierarchy(moduleKey, scope = GLOBAL_SCOPE) {
    const raw = String(moduleKey || '').toLowerCase().trim()
    const resolved = resolveProfileKey(raw) || raw

    let clusterKeys = null
    let targetTree = null

    if (resolved === 'skycode' || HIERARCHY_TREES.skycode.children.includes(raw)) {
        clusterKeys = HIERARCHY_TREES.skycode.children
        targetTree = HIERARCHY_TREES.skycode
    } else if (resolved === 'divulgacao' || HIERARCHY_TREES.divulgacao.children.includes(raw)) {
        clusterKeys = HIERARCHY_TREES.divulgacao.children
        targetTree = HIERARCHY_TREES.divulgacao
    } else if (resolved === 'liberado') {
        clusterKeys = TODOS_MENOS_DONO
        targetTree = HIERARCHY_TREES.liberado
    } else if (HIERARCHY_CLUSTERS[raw]) {
        clusterKeys = HIERARCHY_CLUSTERS[raw]
    } else if (BY_KEY[raw]) {
        clusterKeys = [raw]
    } else {
        return { ok: false, reason: `Módulo "${moduleKey}" não existe.` }
    }

    const cluster = new Set(clusterKeys)
    const modules = {}
    for (const m of MODULES) {
        modules[m.key] = cluster.has(m.key)
    }
    _mutate(scope, () => ({ modules, commands: {} }))

    if (targetTree?.key === 'divulgacao' && scope.endsWith('@g.us')) {
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
        } catch (errCfg) {
            logger.warn(`[MODULE STATE] Falha ao ligar antilink na hierarquia exclusiva em ${scope}: ${errCfg.message}`)
        }
    }

    return { ok: true, activeModules: Array.from(cluster), tree: targetTree }
}

/** Desliga TODOS os módulos — somente no escopo informado. */
function disableAll(scope = GLOBAL_SCOPE) {
    const modules = {}
    for (const m of MODULES) modules[m.key] = false
    _mutate(scope, () => ({ modules, commands: {} }))
    return { ok: true }
}

/** Estado atual dos módulos num escopo (para o comando .modulo). */
function listModules(scope = GLOBAL_SCOPE) {
    return MODULES.map(m => ({ ...m, enabled: isModuleEnabled(m.key, scope) }))
}

/** Overrides por comando num escopo. */
function listCommandOverrides(scope = GLOBAL_SCOPE) {
    return { ..._scopeState(scope).commands }
}

/** Escopos que já têm algum estado salvo (diagnóstico). */
function listScopes() {
    return Object.keys(_load().scopes)
}

/**
 * O ambiente já foi configurado alguma vez?
 * Diferente de "tudo desligado": aqui não existe registro nenhum.
 * @param {string} scope
 */
function hasScope(scope) {
    return Boolean(_load().scopes[scope])
}

/**
 * Provisiona um ambiente NUNCA configurado com o conjunto padrão.
 *
 * Todo módulo nasce OFF, o que é bom como política — mas significa que um grupo
 * recém-adicionado fica MUDO e ninguém entende por quê: o bot lê tudo e não
 * responde nada. O dono só descobre testando comando por comando.
 *
 * Isto age SOMENTE em ambiente sem registro algum. Um grupo onde alguém
 * desligou módulos de propósito já tem registro e não é tocado — a decisão
 * explícita do dono continua valendo.
 *
 * `enableAll` deixa `skycode` e `divulgacao` de fora: um grupo novo nasce com
 * o uso comum funcionando, e o dono estreita depois aplicando um perfil.
 *
 * @param {string} scope
 * @returns {boolean} true se provisionou agora
 */
function provisionIfNew(scope) {
    if (!scope || hasScope(scope)) return false

    // Grupo novo nasce com TODOS os módulos ligados (menos o `skycode`, do dono). Até 2026-10-15
    // entrava no perfil RPG, que deixa de fora `utilidades`, `dev` e `livros`: 1.786 dos 4.569
    // comandos (39%, incluindo o .dossie) ficavam desligados para quem não é dono, e o usuário
    // comum só via "está desligado aqui" enquanto o dono — que fura essa camada — via tudo
    // funcionando. Quem quiser estreitar um grupo aplica um perfil com `.perfilbot`.
    enableAll(scope)
    logger.info(`[MODULE STATE] Ambiente novo "${scope}" provisionado com todos os módulos (skycode segue OFF).`)
    return true
}

/**
 * Liga todos os módulos (menos `skycode`) em TODOS os ambientes já registrados e no privado.
 * Para consertar instalações provisionadas com o padrão antigo (perfil RPG).
 * Os overrides por comando (`.cmd off x`) são decisão explícita de alguém: ficam como estavam.
 * @returns {{ambientes: number, antes: number, depois: number}} nº de módulos ligados somados
 */
function liberarTodosOsAmbientes() {
    const escopos = new Set([...listScopes(), PV_SCOPE])
    let antes = 0
    let depois = 0
    for (const escopo of escopos) {
        antes += listModules(escopo).filter(m => m.enabled).length
        const overrides = listCommandOverrides(escopo)
        enableAll(escopo) // zera os overrides do escopo...
        for (const [nome, ligado] of Object.entries(overrides)) setCommand(nome, ligado, escopo) // ...e volta com eles
        depois += listModules(escopo).filter(m => m.enabled).length
    }
    return { ambientes: escopos.size, antes, depois }
}

function invalidateCache() { _cache = null; _at = 0 }

module.exports = {
    scopeOf,
    hasScope,
    provisionIfNew,
    liberarTodosOsAmbientes,
    isModuleEnabled,
    isCommandEnabled,
    setModule,
    setCommand,
    clearCommand,
    enableAll,
    enableLiberado,
    enableExclusiveHierarchy,
    HIERARCHY_CLUSTERS,
    disableAll,
    listModules,
    listCommandOverrides,
    listScopes,
    invalidateCache,
    STATE_KEY,
    PV_SCOPE,
    GLOBAL_SCOPE
}
