const fs = require('fs')
const { files } = require('../config/paths')
const { acquireLock, releaseLock } = require('../core/locks')
const logger = require('../core/logger')

const { getDatabase } = require('../database/connection')
const userRepo = require('../database/repositories/userRepository')
const guildRepo = require('../database/repositories/guildRepository')
const bossRepo = require('../database/repositories/bossRepository')
const missionRepo = require('../database/repositories/missionRepository')
const warnRepo = require('../database/repositories/warnRepository')
const configRepo = require('../database/repositories/configRepository')
const craftRepo = require('../database/repositories/craftRepository')
const vaultRepo = require('../database/repositories/vaultRepository')

// ═══════════════════════════════════════
// 👤 USUÁRIOS & XP
// ═══════════════════════════════════════
function getXpData() {
    try {
        return userRepo.getAllUsers()
    } catch (e) {
        logger.error('Erro ao ler usuários do SQLite:', e)
        return {}
    }
}

async function saveXpData(data) {
    try {
        await acquireLock('xp_lock')
        const db = getDatabase()
        db.exec('BEGIN')
        try {
            for (const [jid, user] of Object.entries(data)) {
                user.jid = jid
                userRepo.saveUser(user)
            }
            db.exec('COMMIT')
        } catch (inner) {
            try { db.exec('ROLLBACK') } catch (errIgnorado) { logger.warn(`[DATASERVICE] Falha ignorada em src/services/dataService.js:40: ${errIgnorado.message}`) }
            throw inner
        }
    } catch (erro) {
        logger.error('Erro ao salvar usuários no SQLite:', erro)
    } finally {
        releaseLock('xp_lock')
    }
}

function getUser(jid, alternativeJids = []) {
    return userRepo.getUser(jid, alternativeJids)
}

function saveUser(user, opts) {
    userRepo.saveUser(user, opts)
}

/**
 * Cria/carrega um usuário aplicando os defaults do domínio.
 * Export que faltava: 33 comandos chamam `dataService.initializeUser(sender)`
 * e batiam num TypeError silencioso para todo usuário sem linha no banco.
 */
function initializeUser(sender, xpData = {}, alternativeJids = []) {
    return require('./xpService').initializeUser(sender, xpData, alternativeJids)
}

// ═══════════════════════════════════════
// 🐉 BOSSES
// ═══════════════════════════════════════

/**
 * Raids cooperativas de grupo.
 *
 * Ficavam em `bossData.raids`, mas o saveBossData() só persiste `data.lutas` —
 * o objeto `raids` era descartado silenciosamente no save. Resultado: `.raid criar`
 * anunciava a raid e o `.raid atk` seguinte respondia "não há raid ativa".
 * Guardamos numa chave própria do armazenamento de configs, que é persistente.
 */
const RAIDS_KEY = '__raids__'

function getRaidsData() {
    try {
        const r = configRepo.getConfig(RAIDS_KEY)
        return (r && typeof r === 'object') ? r : {}
    } catch (e) {
        logger.error('Erro ao ler Raids:', e)
        return {}
    }
}

function saveRaidsData(raids) {
    try {
        configRepo.saveConfig(RAIDS_KEY, raids || {})
        return true
    } catch (e) {
        logger.error('Erro ao salvar Raids:', e)
        return false
    }
}


/** Eventos de raid globais (.raidevento) — mesma razão do getRaidsData. */
const RAID_EVENTS_KEY = '__raid_events__'

function getRaidEventsData() {
    try {
        const r = configRepo.getConfig(RAID_EVENTS_KEY)
        return (r && typeof r === 'object') ? r : {}
    } catch (e) {
        logger.error('Erro ao ler eventos de Raid:', e)
        return {}
    }
}

function saveRaidEventsData(eventos) {
    try {
        configRepo.saveConfig(RAID_EVENTS_KEY, eventos || {})
        return true
    } catch (e) {
        logger.error('Erro ao salvar eventos de Raid:', e)
        return false
    }
}

function getBossData() {
    try {
        return bossRepo.getAllBossFights()
    } catch (e) {
        logger.error('Erro ao ler Bosses do SQLite:', e)
        return { lutas: {} }
    }
}

async function saveBossData(data) {
    try {
        await acquireLock('boss_lock')
        const lutas = data.lutas || {}
        const existing = bossRepo.getAllBossFights().lutas || {}

        // Remove lutas que não estão mais presentes ou foram finalizadas
        for (const existingId of Object.keys(existing)) {
            if (!lutas[existingId] || lutas[existingId].ativo === false || lutas[existingId].vida <= 0) {
                bossRepo.deleteBossFight(existingId)
            }
        }

        // Sincroniza lutas ativas e vivas
        for (const [idLuta, fight] of Object.entries(lutas)) {
            if (fight && fight.ativo !== false && fight.vida > 0) {
                bossRepo.saveBossFight(idLuta, fight)
            } else {
                bossRepo.deleteBossFight(idLuta)
            }
        }
    } catch (erro) {
        logger.error('Erro ao salvar Bosses no SQLite:', erro)
    } finally {
        releaseLock('boss_lock')
    }
}

// ═══════════════════════════════════════
// 🏰 GUILDAS
// ═══════════════════════════════════════
function getGuildData() {
    try {
        return guildRepo.getAllGuilds()
    } catch (e) {
        logger.error('Erro ao ler Guildas do SQLite:', e)
        return {}
    }
}

async function saveGuildData(data) {
    try {
        await acquireLock('guild_lock')
        for (const [nome, g] of Object.entries(data)) {
            guildRepo.saveGuild(nome, g)
        }
    } catch (erro) {
        logger.error('Erro ao salvar Guildas no SQLite:', erro)
    } finally {
        releaseLock('guild_lock')
    }
}

// ═══════════════════════════════════════
// 📜 MISSÕES DIÁRIAS
// ═══════════════════════════════════════
function getMissoesData() {
    try {
        return missionRepo.getAllMissions()
    } catch (e) {
        logger.error('Erro ao ler Missões do SQLite:', e)
        return {}
    }
}

async function saveMissoesData(data) {
    try {
        await acquireLock('missoes_lock')
        for (const [jid, m] of Object.entries(data)) {
            missionRepo.saveMission(jid, m)
        }
    } catch (erro) {
        logger.error('Erro ao salvar Missões no SQLite:', erro)
    } finally {
        releaseLock('missoes_lock')
    }
}

// ═══════════════════════════════════════
// ⚠️ ADVERTÊNCIAS (WARNS)
// ═══════════════════════════════════════
function getWarnsData() {
    try {
        return warnRepo.getAllWarns()
    } catch (e) {
        logger.error('Erro ao ler Warns do SQLite:', e)
        return {}
    }
}

async function saveWarnsData(data) {
    try {
        await acquireLock('warns_lock')
        for (const [jid, count] of Object.entries(data)) {
            warnRepo.setWarns(jid, count)
        }
    } catch (erro) {
        logger.error('Erro ao salvar Warns no SQLite:', erro)
    } finally {
        releaseLock('warns_lock')
    }
}

// ═══════════════════════════════════════
// ⚙️ CONFIGURAÇÕES DE GRUPO
// ═══════════════════════════════════════
// Cache de configs com TTL curto. getConfigsData roda 3× por mensagem de grupo
// (messageHandler 2× + commandDispatcher 1×). Callers MUTAM o objeto retornado
// antes de salvar, então devolvemos uma cópia (structuredClone) — sem isso, uma
// mutação abandonada contaminaria o cache.
let _cfgCache = null
let _cfgAt = 0
const CFG_TTL_MS = 5000

function getConfigsData() {
    try {
        if (!_cfgCache || Date.now() - _cfgAt > CFG_TTL_MS) {
            _cfgCache = configRepo.getAllConfigs()
            _cfgAt = Date.now()
        }
        return structuredClone(_cfgCache)
    } catch (e) {
        logger.error('Erro ao ler Configs do SQLite:', e)
        return {}
    }
}

function invalidateConfigsCache() {
    _cfgCache = null
    _cfgAt = 0
}

async function saveConfigsData(data) {
    try {
        await acquireLock('configs_lock')
        for (const [groupJid, cfg] of Object.entries(data)) {
            configRepo.saveConfig(groupJid, cfg)
        }
    } catch (erro) {
        logger.error('Erro ao salvar Configs no SQLite:', erro)
    } finally {
        invalidateConfigsCache()
        releaseLock('configs_lock')
    }
}

// ═══════════════════════════════════════
// ⚒️ CRAFTS
// ═══════════════════════════════════════
function getCraftData() {
    try {
        return craftRepo.getAllCrafts()
    } catch (e) {
        logger.error('Erro ao ler Crafts do SQLite:', e)
        return {}
    }
}

async function saveCraftData(data) {
    try {
        await acquireLock('craft_lock')
        for (const [jid, items] of Object.entries(data)) {
            if (Array.isArray(items)) {
                for (const item of items) {
                    craftRepo.addCraft(jid, item)
                }
            }
        }
    } catch (erro) {
        logger.error('Erro ao salvar Crafts no SQLite:', erro)
    } finally {
        releaseLock('craft_lock')
    }
}

module.exports = {
    // Funções compatíveis
    getXpData,
    saveXpData,
    getUser,
    saveUser,
    initializeUser,
    getBossData,
    saveBossData,
    getRaidsData,
    saveRaidsData,
    getRaidEventsData,
    saveRaidEventsData,
    getGuildData,
    saveGuildData,
    getMissoesData,
    saveMissoesData,
    getWarnsData,
    saveWarnsData,
    getConfigsData,
    saveConfigsData,
    invalidateConfigsCache,
    getCraftData,
    saveCraftData,

    // Repositórios diretos
    userRepo,
    guildRepo,
    bossRepo,
    missionRepo,
    warnRepo,
    configRepo,
    craftRepo,
    vaultRepo
}

