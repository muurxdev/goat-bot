/**
 * raidService.js
 * Sistema de Raids Comunitárias com Fases de Chefes para Grupos de WhatsApp.
 * Combates multiplayer com turnos simultâneos, cálculo de dano, aggro,
 * transições de fases e premiação proporcional ao dano causado.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const talentService = require('./talentService')
const logger = require('../core/logger')

const RAID_BOSSES = {
    'albion': {
        id: 'albion',
        name: 'Albion de Pedra Ancestral',
        title: 'Arma Bélica da Guerra Santa',
        hpMax: 50000,
        phases: 2,
        baseRewardCoins: 25000,
        baseRewardXp: 15000,
        attacks: ['Pisotear Sísmico', 'Raio das Trevas', 'Golpe Esmagador']
    },
    'cavaleiro': {
        id: 'cavaleiro',
        name: 'Cavaleiro da Verdade',
        title: 'Mandamento da Verdade',
        hpMax: 120000,
        phases: 3,
        baseRewardCoins: 60000,
        baseRewardXp: 35000,
        attacks: ['Golpe Crítico Letal', 'Julgamento dos Mentirosos', 'Salto Devastador']
    },
    'rainha': {
        id: 'rainha',
        name: 'Rainha das Sombras',
        title: 'Mandamento da Fé',
        hpMax: 160000,
        phases: 3,
        baseRewardCoins: 80000,
        baseRewardXp: 45000,
        attacks: ['Casulo de Trevas', 'Invocação de Almas Corrompidas', 'Presa da Serpente']
    },
    'titã': {
        id: 'titã',
        name: 'Titã do Mandamento do Amor',
        title: 'Cavaleiro do Purgatório',
        hpMax: 280000,
        phases: 4,
        baseRewardCoins: 140000,
        baseRewardXp: 70000,
        attacks: ['Contra-ataque Total Físico', 'Lâmina Rebelde', 'Manto do Desespero']
    },
    'rei_demonio': {
        id: 'rei_demonio',
        name: 'Rei Demônio Supremo',
        title: 'Soberano do Purgatório e das Trevas Eternas',
        hpMax: 650000,
        phases: 5,
        baseRewardCoins: 350000,
        baseRewardXp: 180000,
        attacks: ['Inversão Mágica', 'Raio do Caos', 'Presença Esmagadora']
    }
}

function getActiveRaid(groupJid) {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM group_raids WHERE group_jid = ? AND status = \'ACTIVE\'').get(groupJid)
    if (!row) return null
    return {
        ...row,
        participants: JSON.parse(row.participants || '[]')
    }
}

function startRaid(groupJid, bossKey) {
    const existing = getActiveRaid(groupJid)
    if (existing) {
        return {
            success: false,
            message: `Já existe uma Raid em andamento contra *${existing.boss_name}*! Digite \`.atacar_raid\` para lutar.`
        }
    }

    const boss = RAID_BOSSES[String(bossKey).toLowerCase().trim()] || RAID_BOSSES['albion']
    const raidId = `RAID-${Date.now()}`
    const expiresAt = Date.now() + (2 * 60 * 60 * 1000) // 2 horas para derrotar

    const db = getDatabase()
    db.prepare(`
        INSERT INTO group_raids (id, group_jid, boss_id, boss_name, phase, hp_current, hp_max, participants, status, expires_at, created_at)
        VALUES (?, ?, ?, ?, 1, ?, ?, '[]', 'ACTIVE', ?, ?)
    `).run(raidId, groupJid, boss.id, boss.name, boss.hpMax, boss.hpMax, expiresAt, Date.now())

    return {
        success: true,
        raidId,
        boss,
        expiresAt
    }
}

function attackRaid(groupJid, sender, action = 'atacar') {
    const raid = getActiveRaid(groupJid)
    if (!raid) {
        return {
            success: false,
            message: 'Nenhuma Raid ativa no grupo no momento. Inicie uma com \`.iniciar_raid [chefe]\`.'
        }
    }

    if (Date.now() > raid.expires_at) {
        const db = getDatabase()
        db.prepare('UPDATE group_raids SET status = \'EXPIRED\' WHERE id = ?').run(raid.id)
        return {
            success: false,
            message: `⏰ O tempo limite da Raid contra *${raid.boss_name}* expirou! O chefe fugiu.`
        }
    }

    const user = economyService.carregarUsuario(sender)
    const userLvl = user.level || 1
    const mods = talentService.getCombatModifiers(sender)

    // Cálculo de Dano: base do nível + mods de talentos + variância
    const baseDamage = Math.floor(Math.random() * 250 + 150) * Math.max(1, Math.floor(userLvl * 0.8))
    const isCrit = Math.random() < (0.15 + mods.critChance)
    const critMult = isCrit ? (1.8 + mods.critDmg) : 1.0
    const finalDamage = Math.floor(baseDamage * (1 + mods.atkBonus) * critMult)

    // Atualiza HP do Chefe
    const newHp = Math.max(0, raid.hp_current - finalDamage)
    const bossConfig = RAID_BOSSES[raid.boss_id] || RAID_BOSSES['albion']

    // Atualiza lista de participantes
    const participants = raid.participants
    let part = participants.find(p => p.jid === sender)
    if (part) {
        part.damage += finalDamage
        part.turns += 1
    } else {
        participants.push({
            jid: sender,
            name: user.name || sender.split('@')[0],
            damage: finalDamage,
            turns: 1
        })
    }

    // Calcula fase atual
    const hpFraction = newHp / raid.hp_max
    const totalPhases = bossConfig.phases
    const currentPhase = Math.min(totalPhases, totalPhases - Math.floor(hpFraction * totalPhases) + 1)

    const db = getDatabase()
    const bossDefeated = newHp === 0

    if (bossDefeated) {
        db.prepare('UPDATE group_raids SET hp_current = 0, status = \'DEFEATED\', participants = ? WHERE id = ?')
            .run(JSON.stringify(participants), raid.id)

        // Distribui recompensas proporcionais a cada participante
        const totalRaidDmg = participants.reduce((acc, p) => acc + p.damage, 0)
        const rewards = []

        for (const p of participants) {
            const share = totalRaidDmg > 0 ? (p.damage / totalRaidDmg) : (1 / participants.length)
            const earnedCoins = Math.max(500, Math.floor(bossConfig.baseRewardCoins * share))
            const earnedXp = Math.max(200, Math.floor(bossConfig.baseRewardXp * share))

            const pUser = economyService.carregarUsuario(p.jid)
            pUser.coins = (pUser.coins || 0) + earnedCoins
            pUser.xp = (pUser.xp || 0) + earnedXp
            economyService.salvarUsuario ? economyService.salvarUsuario(pUser) : require('./dataService').saveUser(pUser)

            rewards.push({
                jid: p.jid,
                name: p.name,
                damage: p.damage,
                coins: earnedCoins,
                xp: earnedXp
            })
        }

        return {
            finished: true,
            bossName: raid.boss_name,
            damage: finalDamage,
            isCrit,
            rewards,
            totalParticipants: participants.length
        }
    }

    // Apenas causou dano
    db.prepare('UPDATE group_raids SET hp_current = ?, phase = ?, participants = ? WHERE id = ?')
        .run(newHp, currentPhase, JSON.stringify(participants), raid.id)

    // Contra-ataque aleatório do chefe
    const bossAttack = bossConfig.attacks[Math.floor(Math.random() * bossConfig.attacks.length)]

    return {
        finished: false,
        bossName: raid.boss_name,
        damage: finalDamage,
        isCrit,
        remainingHp: newHp,
        maxHp: raid.hp_max,
        currentPhase,
        totalPhases,
        bossAttack
    }
}

module.exports = {
    RAID_BOSSES,
    getActiveRaid,
    startRaid,
    attackRaid
}
