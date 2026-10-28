/**
 * Dynamic Shield & Realistic Combat Protection Engine
 * 
 * Gerencia a integridade física de escudos, HP destrutível, absorção de dano em PVP,
 * estilhaçamento sob força de oponentes, períodos de desproteção e custo proporcional.
 */

const dataService = require('./dataService');
const logger = require('../core/logger');

// 🛡️ 10 NÍVEIS DE FORJA DE ESCUDOS (Saga Épica Lore)
const SHIELD_TIERS = {
    1: { level: 1, name: 'Escudo de Madeira Reforçado', emoji: '🪵', baseHp: 800, absorcao: 45, minPlayerLevel: 1, baseCost: 500, shatterCooldownHours: 2 },
    2: { level: 2, name: 'Escudo de Ferro Cruzado', emoji: '🛡️', baseHp: 2000, absorcao: 55, minPlayerLevel: 5, baseCost: 1500, shatterCooldownHours: 3 },
    3: { level: 3, name: 'Broquel de Aço Temperado', emoji: '⚔️', baseHp: 4500, absorcao: 65, minPlayerLevel: 15, baseCost: 4000, shatterCooldownHours: 4 },
    4: { level: 4, name: 'Escudo Sagrado Central', emoji: '🦁', baseHp: 10000, absorcao: 75, minPlayerLevel: 30, baseCost: 12000, shatterCooldownHours: 6 },
    5: { level: 5, name: 'Broquel da Fênix Imortal', emoji: '🔥', baseHp: 25000, absorcao: 82, minPlayerLevel: 50, baseCost: 35000, shatterCooldownHours: 6 },
    6: { level: 6, name: 'Égide do Titã Ancestral', emoji: '🗿', baseHp: 60000, absorcao: 88, minPlayerLevel: 75, baseCost: 90000, shatterCooldownHours: 8 },
    7: { level: 7, name: 'Escudo Espelho da Deusa Ardente', emoji: '✨', baseHp: 150000, absorcao: 92, minPlayerLevel: 100, baseCost: 250000, shatterCooldownHours: 8 },
    8: { level: 8, name: 'Barreira Perfeita de Mago', emoji: '🔮', baseHp: 400000, absorcao: 95, minPlayerLevel: 150, baseCost: 700000, shatterCooldownHours: 10 },
    9: { level: 9, name: 'Muralha do Caos Eterno', emoji: '🌌', baseHp: 1000000, absorcao: 98, minPlayerLevel: 200, baseCost: 2000000, shatterCooldownHours: 12 },
    10: { level: 10, name: 'Escudo Absoluto do Rei Arthur', emoji: '👑', baseHp: 3000000, absorcao: 99, minPlayerLevel: 300, baseCost: 6000000, shatterCooldownHours: 12 }
};

// ⏳ DURAÇÕES DISPONÍVEIS E MULTIPLICADORES DE CUSTO PROPORCIONAL
const DURATIONS = {
    '1h':  { label: '1 Hora',   ms: 1 * 3600000,  coinPercent: 0.10, hpMultiplier: 0.8 },
    '6h':  { label: '6 Horas',  ms: 6 * 3600000,  coinPercent: 0.20, hpMultiplier: 0.9 },
    '24h': { label: '24 Horas / 1 Dia', ms: 24 * 3600000, coinPercent: 0.30, hpMultiplier: 1.0 },
    '1d':  { label: '1 Dia',    ms: 24 * 3600000, coinPercent: 0.30, hpMultiplier: 1.0 },
    '7d':  { label: '7 Dias',   ms: 7 * 24 * 3600000, coinPercent: 0.40, hpMultiplier: 1.2 },
    '30d': { label: '30 Dias / 1 Mês', ms: 30 * 24 * 3600000, coinPercent: 0.50, hpMultiplier: 1.5 },
    '1m':  { label: '1 Mês (30 Dias)', ms: 30 * 24 * 3600000, coinPercent: 0.50, hpMultiplier: 1.5 }
};

/**
 * Gera barra gráfica de HP (ex: [██████░░░░] 60%)
 */
function renderHpBar(current, max, length = 10) {
    const cur = Math.max(0, Number(current) || 0);
    const m = Math.max(1, Number(max) || 1);
    const ratio = Math.min(1, cur / m);
    const filled = Math.round(ratio * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Retorna o melhor tier de escudo que o jogador pode equipar pelo seu nível
 */
function getBestTierForLevel(level = 1) {
    const lvl = Math.max(1, Number(level) || 1);
    let best = SHIELD_TIERS[1];
    for (let t = 1; t <= 10; t++) {
        if (SHIELD_TIERS[t].minPlayerLevel <= lvl) {
            best = SHIELD_TIERS[t];
        }
    }
    return best;
}

/**
 * Calcula o custo justo do escudo:
 * Proporcional a 30%-50% do saldo de moedas, respeitando o piso base do tier.
 */
function calculateShieldCost(walletCoins, tier, durationKey = '24h') {
    const dur = DURATIONS[durationKey] || DURATIONS['24h'];
    const coins = Math.max(0, Number(walletCoins) || 0);
    const proportional = Math.floor(coins * dur.coinPercent);
    const floorCost = Math.floor(tier.baseCost * (dur.coinPercent / 0.30));
    return Math.max(floorCost, proportional);
}

/**
 * Obtém o status do escudo ativo do usuário
 */
function getShieldStatus(user) {
    if (!user) return null;
    const shield = user.dynamicShield || user.shield || null;
    const now = Date.now();

    if (!shield || typeof shield !== 'object') {
        const legacyExpires = Number(user.protecaoRouboAte || 0);
        if (legacyExpires > now) {
            return {
                active: true,
                isLegacy: true,
                name: 'Escudo Protetor Básico',
                emoji: '🛡️',
                hp: 1000,
                maxHp: 1000,
                absorcao: 60,
                expiresAt: legacyExpires,
                timeLeftMs: legacyExpires - now,
                inCooldown: false,
                cooldownLeftMs: 0
            };
        }
        return { active: false, inCooldown: false, cooldownLeftMs: 0 };
    }

    const expiresAt = Number(shield.expiresAt || 0);
    const cooldownUntil = Number(shield.cooldownUntil || 0);
    const inCooldown = cooldownUntil > now;
    const isExpired = expiresAt <= now;
    const isBroken = Number(shield.hp || 0) <= 0;
    const active = (!isExpired) && (!isBroken) && (!inCooldown);

    return {
        active,
        tier: shield.tier || 1,
        name: shield.name || 'Escudo',
        emoji: shield.emoji || '🛡️',
        hp: Math.max(0, Number(shield.hp || 0)),
        maxHp: Math.max(1, Number(shield.maxHp || 1)),
        absorcao: Number(shield.absorcao || 50),
        expiresAt,
        timeLeftMs: Math.max(0, expiresAt - now),
        inCooldown,
        cooldownUntil,
        cooldownLeftMs: Math.max(0, cooldownUntil - now),
        shattered: isBroken
    };
}

/**
 * Forja/compra um novo escudo dinâmico para o jogador
 */
function buyShield(user, tierLevel = null, durationKey = '24h') {
    const status = getShieldStatus(user);
    const now = Date.now();

    if (status && status.inCooldown) {
        const hoursLeft = (status.cooldownLeftMs / 3600000).toFixed(1);
        return {
            ok: false,
            error: `⛔ *Escudo Estilhaçado:* Seu escudo foi destruído em combate recente! Você está desprotegido e deve aguardar *${hoursLeft} horas* antes de forjar um novo escudo.`
        };
    }

    const playerLvl = Number(user.level || 1);
    const targetTier = (tierLevel && SHIELD_TIERS[tierLevel])
        ? SHIELD_TIERS[tierLevel]
        : getBestTierForLevel(playerLvl);

    if (targetTier.minPlayerLevel > playerLvl) {
        return {
            ok: false,
            error: `❌ Nível insuficiente. O escudo *${targetTier.name}* exige Nível ${targetTier.minPlayerLevel} (seu nível: ${playerLvl}).`
        };
    }

    const dur = DURATIONS[durationKey] || DURATIONS['24h'];
    const walletCoins = Math.max(0, Number(user.coins || 0));
    const cost = calculateShieldCost(walletCoins, targetTier, durationKey);

    if (walletCoins < cost) {
        return {
            ok: false,
            error: `❌ *Saldo insuficiente:* A forja deste escudo (${dur.label}) custa *${cost.toLocaleString('pt-BR')} Coins* (seu saldo: ${walletCoins.toLocaleString('pt-BR')} Coins).`
        };
    }

    // Deduz moedas
    user.coins = walletCoins - cost;

    const finalHp = Math.round(targetTier.baseHp * dur.hpMultiplier);
    const expiresAt = now + dur.ms;

    user.dynamicShield = {
        tier: targetTier.level,
        name: targetTier.name,
        emoji: targetTier.emoji,
        hp: finalHp,
        maxHp: finalHp,
        absorcao: targetTier.absorcao,
        createdAt: now,
        expiresAt,
        cooldownUntil: 0
    };

    // Sincroniza retrocompatibilidade com protecaoRouboAte
    user.protecaoRouboAte = expiresAt;

    logger.info(`[SHIELD ENGINE] ${user.jid || user.phone} forjou ${targetTier.name} (${dur.label}) por ${cost} coins. HP: ${finalHp}`);

    return {
        ok: true,
        tier: targetTier,
        shield: user.dynamicShield,
        cost,
        remainingCoins: user.coins,
        durationLabel: dur.label
    };
}

/**
 * Absorve dano recebido em combate PvP ou tentativa de roubo
 * @param {object} defenderUser - Objeto do usuário defensor
 * @param {number} incomingDamage - Dano total do golpe
 * @param {object} attackerInfo - Informações do atacante { name, cp, level }
 * @returns {object} { absorbed, absorbedDamage, residualDamage, broken, shieldHpRemaining, maxHp, logMessage }
 */
function processDamageAbsorption(defenderUser, incomingDamage, attackerInfo = {}) {
    const status = getShieldStatus(defenderUser);
    const damage = Math.max(1, Number(incomingDamage) || 1);

    if (!status || !status.active || status.hp <= 0) {
        return {
            hasShield: false,
            absorbed: false,
            absorbedDamage: 0,
            residualDamage: damage,
            broken: false,
            shieldHpRemaining: 0,
            maxHp: 0,
            logMessage: 'Defensor não possui escudo ativo. Dano total sofrido!'
        };
    }

    // Absorção percentual
    const absorbPercent = status.absorcao / 100;
    const potentialAbsorption = Math.floor(damage * absorbPercent);
    const directLeakDamage = damage - potentialAbsorption;

    let absorbedDamage = 0;
    let residualDamage = 0;
    let broken = false;

    if (potentialAbsorption >= status.hp) {
        // Escudo quebrou!
        absorbedDamage = status.hp;
        residualDamage = directLeakDamage + (potentialAbsorption - status.hp);
        broken = true;

        // Aplica cooldown de desproteção
        const tierConfig = SHIELD_TIERS[status.tier] || SHIELD_TIERS[1];
        const cooldownMs = (tierConfig.shatterCooldownHours || 4) * 3600000;
        const cooldownUntil = Date.now() + cooldownMs;

        if (defenderUser.dynamicShield) {
            defenderUser.dynamicShield.hp = 0;
            defenderUser.dynamicShield.cooldownUntil = cooldownUntil;
        }
        defenderUser.protecaoRouboAte = 0;

        logger.info(`[SHIELD SHATTERED] Escudo de ${defenderUser.jid} foi DESTRUÍDO por golpe de ${damage} dano.`);
    } else {
        // Escudo absorveu com sucesso
        absorbedDamage = potentialAbsorption;
        residualDamage = directLeakDamage;
        if (defenderUser.dynamicShield) {
            defenderUser.dynamicShield.hp = status.hp - absorbedDamage;
        }
    }

    const hpRemaining = defenderUser.dynamicShield ? defenderUser.dynamicShield.hp : 0;
    const hpBar = renderHpBar(hpRemaining, status.maxHp, 10);

    return {
        hasShield: true,
        absorbed: true,
        shieldName: status.name,
        shieldEmoji: status.emoji,
        absorbedDamage,
        residualDamage,
        broken,
        shieldHpRemaining: hpRemaining,
        maxHp: status.maxHp,
        hpBar,
        absorbPercent: status.absorcao
    };
}

module.exports = {
    SHIELD_TIERS,
    DURATIONS,
    renderHpBar,
    getBestTierForLevel,
    calculateShieldCost,
    getShieldStatus,
    buyShield,
    processDamageAbsorption
};

