/**
 * Motor Slayer Legends RPG
 * Cálculo de atributos reais de combate, Poder de Combate (CP) e Patentes Slayer
 */

const { petsDisponiveis, classes, classesLendarias, equipamentos, pocoes } = require('../utils/constants')

const SLAYER_RANKS = [
    { minCp: 0, title: '🥉 Novice Slayer', tier: 'Tier I' },
    { minCp: 1500, title: '🥈 Iron Slayer', tier: 'Tier II' },
    { minCp: 4000, title: '🥇 Silver Slayer', tier: 'Tier III' },
    { minCp: 10000, title: '💎 Gold Slayer', tier: 'Tier IV' },
    { minCp: 25000, title: '🔮 Platinum Slayer', tier: 'Tier V' },
    { minCp: 60000, title: '👑 Diamond Slayer', tier: 'Tier VI' },
    { minCp: 150000, title: '⚔️ Master Slayer', tier: 'Tier VII' },
    { minCp: 350000, title: '🌟 Grandmaster Slayer', tier: 'Tier VIII' },
    { minCp: 800000, title: '🌌 Immortal Slayer Legend', tier: 'Tier IX' }
]

function getSlayerRank(cp) {
    let rank = SLAYER_RANKS[0]
    for (const r of SLAYER_RANKS) {
        if (cp >= r.minCp) {
            rank = r
        } else {
            break
        }
    }
    return rank
}

function calculateSlayerStats(user = {}) {
    const level = Math.max(1, Number(user.level || 1))
    const wins = Number(user.wins || 0)
    const bossesMortos = Number(user.bossesMortos || 0)
    const arenaPontos = Number(user.arenaPontos || 0)
    const arenaAtual = Number(user.arenaAtual || 1)
    const bugPower = Number(user.bugPower || user.bug_power || 0)

    // 1. ATK (Ataque Base + Escalonamento)
    let atk = (level * 25) + 120
    let def = (level * 12) + 50
    let hpMax = 100 + (level * 15)
    let critRate = 5.0 // 5% base
    let critDamage = 150 // 150% base (1.5x)
    let attackSpeed = 1.00 // 1.00 atk/s

    // 2. Modificadores de Classe
    const classe = user.classe
    if (classe) {
        switch (classe) {
            case 'guerreiro':
                atk += 200
                def += 80
                hpMax += 200
                break
            case 'mago':
                atk += 180
                critRate += 15.0
                critDamage += 50
                break
            case 'arqueiro':
                atk += 150
                critRate += 20.0
                critDamage += 40
                break
            case 'curandeiro':
                atk += 100
                hpMax += 400
                def += 60
                break
            case 'ladino':
                atk += 250
                critRate += 25.0
                critDamage += 60
                break
            case 'paladino':
                atk += 120
                def += 150
                hpMax += 250
                break
            case 'necromante':
                atk += 180
                critDamage += 80
                hpMax += 100
                break
            case 'berserker':
                atk += 300
                def -= 40
                critRate += 10.0
                break
        }
    }

    // 3. Modificadores de Classe Lendária
    const lendaria = user.classeLendaria
    if (lendaria) {
        switch (lendaria) {
            case 'dragonite':
                atk += 800
                def += 300
                hpMax += 600
                break
            case 'lordesombras':
                atk += 650
                critRate += 25.0
                critDamage += 100
                break
            case 'arcanosupremo':
                atk += 700
                critRate += 30.0
                critDamage += 120
                break
            case 'sentinela':
                atk += 400
                def += 500
                hpMax += 800
                break
            case 'pecado_ira':
                atk += 1600
                critRate += 35.0
                critDamage += 150
                break
            case 'goat_assault':
                atk += 2200
                def += 700
                hpMax += 2000
                critRate += 40.0
                critDamage += 200
                attackSpeed += 0.50
                break
        }
    }

    // 4. Modificadores de Slots, Armas & Equipamentos Reais
    const { getItem } = require('./rpgEquipmentService')
    const slots = user.slots || {}
    for (const sKey of Object.keys(slots)) {
        const itemRef = slots[sKey]
        if (itemRef) {
            const item = typeof itemRef === 'object' ? itemRef : getItem(itemRef)
            if (item) {
                atk += (item.atk || 0)
                def += (item.def || 0)
                hpMax += (item.hp || 0)
                critRate += (item.crit || 0)
            }
        }
    }

    const arma = user.arma || user.equipado
    if (arma && !slots.arma) {
        const item = getItem(arma)
        if (item) {
            atk += (item.atk || 0)
            def += (item.def || 0)
            hpMax += (item.hp || 0)
            critRate += (item.crit || 0)
        } else {
            if (arma.includes('Espada') || arma.includes('espada')) atk += 250
            if (arma.includes('Lança') || arma.includes('lanca')) atk += 400
            if (arma.includes('Coroa') || arma.includes('coroa')) { atk += 600; def += 200 }
            if (arma.includes('Armadura') || arma.includes('armadura')) { def += 350; hpMax += 500 }
            if (arma.includes('Escudo') || arma.includes('escudo')) { def += 450; hpMax += 400 }
            if (arma.includes('Manto') || arma.includes('manto')) { atk += 300; critRate += 10.0 }
            if (arma.includes('Pulseira') || arma.includes('pulseira')) { atk += 500; critDamage += 50 }
        }
    }

    // 4.1 Bônus do Nível de Forja / Refinamento Ancestral
    const forgeLevel = Number(user.forgeLevel || 0)
    if (forgeLevel > 0) {
        atk += forgeLevel * 25
        def += forgeLevel * 20
        hpMax += forgeLevel * 50
    }

    // 5. Modificadores de Pet
    if (user.pet) {
        const petKey = typeof user.pet === 'string' ? user.pet : user.pet?.tipo
        const petBonus = petsDisponiveis[petKey]
        if (petBonus) {
            if (petBonus.tipo === 'dano') atk += petBonus.valor * 2
            if (petBonus.tipo === 'critico') critRate += 10.0
            if (petBonus.tipo === 'dobro') critDamage += 60
        }
    }

    // 6. Modificadores de Poção Ativa
    const potTipo = user.pocaoAtiva?.tipo || user.pocao_ativa_tipo
    const potExpira = user.pocaoAtiva?.expira || user.pocao_ativa_expira
    if (potTipo && (!potExpira || Date.now() < potExpira)) {
        const pot = pocoes[potTipo]
        if (pot?.dano) atk = Math.floor(atk * (1 + pot.dano))
    }

    // 7. Cálculo Geral de Poder Slayer (CP - Combat Power)
    const mitigationPercent = Math.min(75, Math.round((def / (def + 1000)) * 100))
    const cp = Math.floor(
        (atk * 4) +
        (def * 3) +
        (hpMax * 2) +
        (level * 100) +
        (bossesMortos * 180) +
        (wins * 50) +
        (arenaPontos * 15) +
        (Math.round(critRate) * 40) +
        (Math.round(critDamage) * 10)
    )

    const slayerRank = getSlayerRank(cp)

    return {
        cp,
        slayerRank: slayerRank.title,
        slayerTier: slayerRank.tier,
        atk,
        def,
        hpMax,
        currentHp: Math.min(hpMax, Number(user.hp || hpMax)),
        critRate: Math.min(90, Number(critRate.toFixed(1))),
        critDamage,
        attackSpeed: Number(attackSpeed.toFixed(2)),
        mitigationPercent,
        wins,
        losses: Number(user.losses || 0),
        bossesMortos,
        arenaPontos,
        arenaAtual
    }
}

module.exports = {
    calculateSlayerStats,
    getSlayerRank,
    SLAYER_RANKS
}
