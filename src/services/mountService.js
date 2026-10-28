/**
 * mountService.js
 * Sistema de Montarias e Mascotes de Exploração e Combate do Reino de Reino.
 * Captura, adoção, alimentação, treino, bônus de velocidade e buffs de combate.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const MOUNTS_CATALOG = {
    'guardiao_porco': {
        id: 'guardiao_porco',
        name: 'Guardião - Capitão das Sobras',
        type: 'Mascote Terrestre',
        cost: 3000,
        speedBonus: 0.10,
        desc: 'Devora as sobras das refeições e localiza moedas perdidas na estrada.'
    },
    'grifo_real': {
        id: 'grifo_real',
        name: 'Grifo Dourado Central',
        type: 'Montaria Alada',
        cost: 15000,
        speedBonus: 0.25,
        desc: 'Majestosa criatura alada capaz de cruzar cadeias montanhosas em minutos.'
    },
    'dragao_carmesim': {
        id: 'dragao_carmesim',
        name: 'Dragão Carmesim do Purgatório',
        type: 'Montaria Lendária',
        cost: 80000,
        speedBonus: 0.45,
        desc: 'Cospe labaredas incandescentes e aterroriza monstros errantes nas viagens.'
    },
    'pegasus_alado': {
        id: 'pegasus_alado',
        name: 'Pegasus Sagrado das Nuvens',
        type: 'Montaria Divina',
        cost: 45000,
        speedBonus: 0.35,
        desc: 'Cavalo alado com crina reluzente que confere proteção contra emboscadas.'
    },
    'lobo_sombras': {
        id: 'lobo_sombras',
        name: 'Lobo Sombrio das Estepes',
        type: 'Mascote de Caça',
        cost: 12000,
        speedBonus: 0.20,
        desc: 'Rastreador silencioso com olfato apurado para encontrar masmorras secretas.'
    },
    'fenix_fogo': {
        id: 'fenix_fogo',
        name: 'Fênix Solar Dourada',
        type: 'Mascote Místico',
        cost: 120000,
        speedBonus: 0.50,
        desc: 'Pássaro mitológico que renasce das cinzas e regenera vida do montador.'
    }
}

function getAllAvailableMounts() {
    return Object.values(MOUNTS_CATALOG)
}

function getUserMounts(jid) {
    const db = getDatabase()
    return db.prepare('SELECT * FROM user_mounts WHERE owner_jid = ? ORDER BY equipped DESC, level DESC').all(jid)
}

function adoptMount(jid, mountId) {
    mountId = String(mountId).toLowerCase().trim()
    const mount = MOUNTS_CATALOG[mountId]
    if (!mount) {
        return {
            success: false,
            message: `Montaria inválida. Opções: *${Object.keys(MOUNTS_CATALOG).join(', ')}*`
        }
    }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < mount.cost) {
        return {
            success: false,
            message: `Saldo insuficiente para adotar *${mount.name}*! Preço: *${mount.cost.toLocaleString('pt-BR')} moedas*.`
        }
    }

    user.coins = (user.coins || 0) - mount.cost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    const mountDbId = `MNT-${Date.now()}`
    db.prepare(`
        INSERT INTO user_mounts (id, owner_jid, mount_id, name, level, stamina, speed_bonus, equipped, created_at)
        VALUES (?, ?, ?, ?, 1, 100, ?, 1, ?)
    `).run(mountDbId, jid, mount.id, mount.name, mount.speedBonus, Date.now())

    // Desequipa outras anteriores
    db.prepare('UPDATE user_mounts SET equipped = 0 WHERE owner_jid = ? AND id != ?').run(jid, mountDbId)

    return {
        success: true,
        mountDbId,
        name: mount.name,
        cost: mount.cost,
        newBalance: user.coins
    }
}

function equipMount(jid, mountDbId) {
    const db = getDatabase()
    const m = db.prepare('SELECT * FROM user_mounts WHERE id = ? AND owner_jid = ?').get(mountDbId, jid)
    if (!m) return { success: false, message: 'Montaria não encontrada no seu estábulo.' }

    db.prepare('UPDATE user_mounts SET equipped = 0 WHERE owner_jid = ?').run(jid)
    db.prepare('UPDATE user_mounts SET equipped = 1 WHERE id = ?').run(m.id)

    return {
        success: true,
        mountName: m.name
    }
}

function feedMount(jid, mountDbId) {
    const db = getDatabase()
    const m = db.prepare('SELECT * FROM user_mounts WHERE id = ? AND owner_jid = ?').get(mountDbId, jid)
    if (!m) return { success: false, message: 'Montaria não encontrada no seu estábulo.' }

    if (m.stamina >= 100) {
        return { success: false, message: `Sua montaria *${m.name}* já está totalmente alimentada e cheia de energia (100%)!` }
    }

    const feedCost = 500
    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < feedCost) {
        return { success: false, message: `Custo de ração especial: *${feedCost} moedas*. Saldo insuficiente.` }
    }

    user.coins = (user.coins || 0) - feedCost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    db.prepare('UPDATE user_mounts SET stamina = 100, level = level + 1 WHERE id = ?').run(m.id)

    return {
        success: true,
        mountName: m.name,
        newLevel: m.level + 1,
        cost: feedCost,
        newBalance: user.coins
    }
}

module.exports = {
    MOUNTS_CATALOG,
    getAllAvailableMounts,
    getUserMounts,
    adoptMount,
    equipMount,
    feedMount
}
