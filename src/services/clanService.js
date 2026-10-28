/**
 * clanService.js
 * Sistema de Clãs, Guildas e Guerras Territoriais de Reino.
 * Gerenciamento de clãs, cofre compartilhado, conquista e defesa de territórios,
 * buffs de atributos para membros e histórico de conquistas.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const TERRITORIES = [
    { id: 'central_capital', name: 'Capital Real Central', bonusXp: 0.15, bonusCoins: 0.15, defensePower: 5000 },
    { id: 'cidadedourada_fortaleza', name: 'Fortaleza Caótica de Cidade Dourada', bonusXp: 0.20, bonusCoins: 0.10, defensePower: 6000 },
    { id: 'floresta_fadas', name: 'Bosque Sagrado do Rei das Fadas', bonusXp: 0.25, bonusCoins: 0.05, defensePower: 4500 },
    { id: 'purgatorio_portal', name: 'Garganta do Purgatório', bonusXp: 0.30, bonusCoins: 0.20, defensePower: 8000 },
    { id: 'torre_coliseu', name: 'Coliseu dos Festivais de Torre', bonusXp: 0.10, bonusCoins: 0.25, defensePower: 4000 },
    { id: 'vilarejo_ruinas', name: 'Ruínas Antigas de Vilarejo', bonusXp: 0.18, bonusCoins: 0.12, defensePower: 3500 },
    { id: 'edimburgo_castelo', name: 'Castelo dos Vampiros de Edimburgo', bonusXp: 0.22, bonusCoins: 0.18, defensePower: 5500 },
    { id: 'mar_ocidental_porto', name: 'Porto dos Mares Ocidentais', bonusXp: 0.10, bonusCoins: 0.30, defensePower: 4200 }
]

function getClan(clanName) {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM guilds WHERE nome = ? COLLATE NOCASE').get(clanName)
    if (!row) return null
    return {
        ...row,
        membros: JSON.parse(row.membros || '[]')
    }
}

function getUserClan(jid) {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM guilds').all()
    for (const r of rows) {
        if (r.dono === jid) {
            return { ...r, membros: JSON.parse(r.membros || '[]'), isOwner: true }
        }
        const membros = JSON.parse(r.membros || '[]')
        if (membros.includes(jid)) {
            return { ...r, membros, isOwner: false }
        }
    }
    return null
}

function createClan(jid, clanName) {
    const cleanName = String(clanName || '').trim().replace(/[*_~`]/g, '')
    if (cleanName.length < 3 || cleanName.length > 25) {
        return { success: false, message: 'O nome do clã deve ter entre 3 e 25 caracteres.' }
    }

    const existingUserClan = getUserClan(jid)
    if (existingUserClan) {
        return { success: false, message: `Você já pertence ao clã *${existingUserClan.nome}*! Saia antes de criar outro.` }
    }

    const existingName = getClan(cleanName)
    if (existingName) {
        return { success: false, message: `Já existe um clã com o nome *${cleanName}* no Reino!` }
    }

    const user = economyService.carregarUsuario(jid)
    const cost = 25000
    if ((user.coins || 0) < cost) {
        return {
            success: false,
            message: `Custo para fundar um clã: *${cost.toLocaleString('pt-BR')} moedas*. Saldo insuficiente.`
        }
    }

    user.coins = (user.coins || 0) - cost
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    db.prepare(`
        INSERT INTO guilds (nome, dono, level, xp, coins, membros)
        VALUES (?, ?, 1, 0, 0, ?)
    `).run(cleanName, jid, JSON.stringify([jid]))

    return {
        success: true,
        clanName: cleanName,
        cost,
        newBalance: user.coins
    }
}

function donateToVault(jid, amount) {
    amount = Math.floor(Number(amount) || 0)
    if (amount <= 0) return { success: false, message: 'Valor de doação inválido.' }

    const clan = getUserClan(jid)
    if (!clan) return { success: false, message: 'Você não faz parte de nenhum clã.' }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < amount) {
        return { success: false, message: `Saldo insuficiente para doar ao tesouro do clã.` }
    }

    user.coins = (user.coins || 0) - amount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    // 1 moeda doada = 1 ponto de XP para o clã
    db.prepare('UPDATE guilds SET coins = coins + ?, xp = xp + ? WHERE nome = ?')
        .run(amount, amount, clan.nome)

    // Atualiza nível do clã (cada 50.000 XP = 1 nível)
    const updated = getClan(clan.nome)
    const newLevel = Math.min(10, Math.floor(updated.xp / 50000) + 1)
    if (newLevel > updated.level) {
        db.prepare('UPDATE guilds SET level = ? WHERE nome = ?').run(newLevel, clan.nome)
    }

    return {
        success: true,
        donated: amount,
        clanName: clan.nome,
        newVaultCoins: updated.coins + amount,
        clanLevel: Math.max(updated.level, newLevel),
        userBalance: user.coins
    }
}

function getTerritories() {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM clan_territories').all()
    const map = new Map(rows.map(r => [r.id, r]))

    return TERRITORIES.map(t => {
        const saved = map.get(t.id)
        return {
            ...t,
            clanName: saved ? saved.clan_name : null,
            defensePower: saved ? saved.defense_power : t.defensePower,
            capturedAt: saved ? saved.captured_at : null
        }
    })
}

function captureTerritory(jid, territoryId) {
    const clan = getUserClan(jid)
    if (!clan) return { success: false, message: 'Apenas membros de clãs podem conquistar territórios.' }
    if (!clan.isOwner) return { success: false, message: 'Apenas o Líder do clã pode ordenar o ataque a um território.' }

    const t = TERRITORIES.find(x => x.id === territoryId)
    if (!t) return { success: false, message: `Território desconhecido. Consulte a lista com \`.territorios\`.` }

    const db = getDatabase()
    let current = db.prepare('SELECT * FROM clan_territories WHERE id = ?').get(t.id)

    if (current && current.clan_name && current.clan_name.toLowerCase() === clan.nome.toLowerCase()) {
        return { success: false, message: `O território *${t.name}* já está sob domínio do seu clã!` }
    }

    // Custo de expedição militar do cofre do clã
    const warCost = 10000
    if (clan.coins < warCost) {
        return {
            success: false,
            message: `O cofre do clã precisa de pelo menos *${warCost.toLocaleString('pt-BR')} moedas* para custear a guerra de conquista. Doe com \`.doarcla\`.`
        }
    }

    // Debita do cofre
    db.prepare('UPDATE guilds SET coins = coins - ? WHERE nome = ?').run(warCost, clan.nome)

    // Registra ou atualiza posse do território
    if (current) {
        db.prepare(`
            UPDATE clan_territories
            SET clan_name = ?, captured_at = ?, defense_power = ?
            WHERE id = ?
        `).run(clan.nome, Date.now(), t.defensePower + (clan.level * 500), t.id)
    } else {
        db.prepare(`
            INSERT INTO clan_territories (id, name, clan_name, bonus_xp, bonus_coins, defense_power, captured_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(t.id, t.name, clan.nome, t.bonusXp, t.bonusCoins, t.defensePower + (clan.level * 500), Date.now())
    }

    return {
        success: true,
        territoryName: t.name,
        clanName: clan.nome,
        bonusXp: Math.round(t.bonusXp * 100),
        bonusCoins: Math.round(t.bonusCoins * 100)
    }
}

function getClanTerritoryBuff(jid) {
    const clan = getUserClan(jid)
    if (!clan) return { bonusXp: 0, bonusCoins: 0 }

    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM clan_territories WHERE clan_name = ? COLLATE NOCASE').all(clan.nome)

    let totalBonusXp = 0
    let totalBonusCoins = 0
    for (const r of rows) {
        totalBonusXp += r.bonus_xp || 0
        totalBonusCoins += r.bonus_coins || 0
    }

    return {
        clanName: clan.nome,
        territoriesCount: rows.length,
        bonusXp: totalBonusXp,
        bonusCoins: totalBonusCoins
    }
}

module.exports = {
    TERRITORIES,
    getClan,
    getUserClan,
    createClan,
    donateToVault,
    getTerritories,
    captureTerritory,
    getClanTerritoryBuff
}
