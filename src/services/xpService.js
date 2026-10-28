const logger = require('../core/logger')
const { petsDisponiveis, resolvePetKey } = require('../utils/constants');
const { getItem } = require('./rpgEquipmentService');
const { barraXP, getCargo, getRank } = require('../utils/helpers')
const { verificarConquistas } = require('./achievementEngine')

const userRepo = require('../database/repositories/userRepository')

function initializeUser(sender, xpData = {}, alternativeJids = []) {
    let user = xpData[sender]

    if (!user || (user.messages === 0 && user.xp === 0 && user.level === 1 && !user.registered)) {
        try {
            const dbUser = userRepo.getUser(sender, alternativeJids)
            if (dbUser && (dbUser.messages > 0 || dbUser.xp > 0 || dbUser.coins > 0 || dbUser.level > 1 || (dbUser.inventario && dbUser.inventario.length > 0) || dbUser.registered || dbUser.displayNick)) {
                user = dbUser
            } else if (dbUser && Object.keys(dbUser).length > 0) {
                user = dbUser
            } else if (!user) {
                user = {}
            }
        } catch (errIgnorado) { logger.warn(`[XPSERVICE] Falha ignorada em src/services/xpService.js:21: ${errIgnorado.message}`) }
    }

    if (!user) {
        user = {}
    }

    const defaults = {
        jid: sender,
        xp: 0,
        level: 1,
        messages: 0,
        streak: 0,
        coins: 0,
        conquistas: [],
        rep: 0,
        lastDaily: 0,
        inventario: [],
        inventory: [],
        equipado: null,
        arma: null,
        wins: 0,
        losses: 0,
        bossesMortos: 0,
        registered: false,
        displayNick: null,
        rpgEnabled: true,
        bossesResumo: {},
        bossesDerrotados: [],
        classe: null,
        classeLendaria: null,
        bugPower: 0,
        pets: [],
        pet: null,
        weeklyXp: 0,
        weeklyCoins: 0,
        messagesGroup: 0,
        messagesPv: 0,
        commandsGroup: 0,
        commandsPv: 0,
        xpGroup: 0,
        xpPv: 0,
        hpMax: 100,
        hp: 100,
        mundo: 'floresta',
        mochila: 20,
        arenaPontos: 0,
        arenaAtual: 1,
        nicknameRpg: null,
        forgeLevel: 0,
        dungeonFloor: 1,
        dungeonRecorde: 0,
        slots: {
            capacete: null,
            peitoral: null,
            calca: null,
            botas: null,
            arma: null,
            escudo: null,
            amuleto: null
        }
    }

    for (const key of Object.keys(defaults)) {
        if (user[key] === undefined || user[key] === null) {
            user[key] = typeof defaults[key] === 'object' && defaults[key] !== null
                ? (Array.isArray(defaults[key]) ? [] : { ...defaults[key] })
                : defaults[key]
        }
    }

    if (typeof user.slots === 'object' && user.slots !== null) {
        user.slots = { ...defaults.slots, ...user.slots }
    }

    if (Array.isArray(user.inventario) && user.inventario.length > 0 && (!Array.isArray(user.inventory) || user.inventory.length === 0)) {
        user.inventory = user.inventario
    } else if (Array.isArray(user.inventory) && user.inventory.length > 0 && (!Array.isArray(user.inventario) || user.inventario.length === 0)) {
        user.inventario = user.inventory
    }

    xpData[sender] = user

    try {
        userRepo.saveUser(user)
    } catch (errIgnorado) { logger.warn(`[XPSERVICE] Falha ignorada em src/services/xpService.js:106: ${errIgnorado.message}`) }

    return user
}

function calcularXpNecessario(level) {
    const lvl = Math.max(1, Math.floor(Number(level) || 1))
    return Math.floor(100 * Math.pow(lvl, 1.5))
}

/**
 * Calcula o nível exato alcançado dado um montante total de XP acumulado no escopo (Grupo, PV ou RPG)
 * @param {number} totalXp 
 * @returns {{ level: number, xpNoNivel: number, xpNecessario: number, percent: number }}
 */
function calcularLevelDeXpTotal(totalXp) {
    let xpRestante = Math.max(0, Math.floor(Number(totalXp) || 0));
    let lvl = 1;
    let req = calcularXpNecessario(lvl);
    while (xpRestante >= req && lvl < 5000) {
        xpRestante -= req;
        lvl++;
        req = calcularXpNecessario(lvl);
    }
    return {
        level: lvl,
        xpNoNivel: xpRestante,
        xpNecessario: req,
        percent: Math.min(100, Math.floor((xpRestante / req) * 100))
    };
}

/**
 * Processa a subida de nível e concede marcos de evolução (HP, Coins, Conquistas)
 * @param {object} user - Perfil do usuário
 * @param {object} [options] - Opções de controle
 * @param {number} [options.maxLevels=50] - Limite máximo de níveis a subir nesta chamada
 * @returns {object} { subiu, levelsGanhos, novoLevel, ganhoCoins, ganhoHp, conquistas }
 */
function processarLevelUp(user, options = {}) {
    if (!user) return { subiu: false, levelsGanhos: 0, novoLevel: 1, ganhoCoins: 0, ganhoHp: 0, conquistas: [] }
    let subiu = false
    let levelsGanhos = 0
    let ganhoCoins = 0
    let ganhoHp = 0

    user.level = Math.max(1, Math.floor(Number(user.level) || 1))
    let maxXp = calcularXpNecessario(user.level)

    // Trava de segurança configurável (para chat = 1 por mensagem; para combate/RPG = até 50)
    const MAX_LEVELS_PER_CALL = Math.max(1, Math.min(100, Number(options.maxLevels) || 50))

    while ((user.xp || 0) >= maxXp && levelsGanhos < MAX_LEVELS_PER_CALL) {
        user.xp -= maxXp
        user.level += 1
        subiu = true
        levelsGanhos += 1

        // Recompensa em coins por nível
        const coinsBonus = user.level * 50
        user.coins = (user.coins || 0) + coinsBonus
        ganhoCoins += coinsBonus

        // Ganho de HP a CADA nível (+15) com bônus extra a cada 5 níveis (+35)
        const hpGain = 15 + (user.level % 5 === 0 ? 35 : 0)
        user.hpMax = (user.hpMax || 100) + hpGain
        ganhoHp += hpGain

        // Ganho leve de atributos por nível (poder do personagem cresce)
        user.atk = (user.atk || 10) + 2
        user.def = (user.def || 5) + 1

        maxXp = calcularXpNecessario(user.level)
    }

    // Se atingiu o limite de níveis em uma única chamada e ainda sobrou XP anômalo,
    // normaliza para não exceder limites extravagantes (apenas quando não é limitado a poucos níveis)
    if (MAX_LEVELS_PER_CALL > 5 && levelsGanhos >= MAX_LEVELS_PER_CALL && (user.xp || 0) > maxXp * 2) {
        user.xp = maxXp - 1
    }

    // Restaura a vida completa ao subir de nível apenas UMA VEZ no final
    if (subiu) {
        try {
            const { resolveHp } = require('./characterEngine')
            user.hpMax = resolveHp(user).max
        } catch (e) { 
            const logger = require('../core/logger')
            logger.warn('[XP SERVICE] resolveHp fallback — mantendo hpMax incremental', e.message)
        }
        user.hp = user.hpMax || 100
    }

    // Avalia conquistas desbloqueadas
    const conquistas = verificarConquistas(user)

    return {
        subiu,
        levelsGanhos,
        novoLevel: user.level,
        ganhoCoins,
        ganhoHp,
        conquistas
    }
}

/**
 * Progresso de XP do usuário para o próximo nível.
 * @returns {{ atual, necessario, faltam, percent, barra, poder }}
 */
function getXpProgress(user) {
    const level = user.level || 1
    const atual = user.xp || 0
    const necessario = calcularXpNecessario(level)
    const faltam = Math.max(0, necessario - atual)
    const percent = Math.min(100, Math.floor((atual / necessario) * 100))
    const blocos = 10
    const cheios = Math.floor((percent / 100) * blocos)
    const barra = '🟩'.repeat(cheios) + '⬛'.repeat(blocos - cheios)
    // "Poder" = medida agregada de força do personagem
    const poder = Math.floor((level * 10) + (user.atk || 10) * 2 + (user.def || 5) * 1.5 + (user.hpMax || 100) / 5)
    return { atual, necessario, faltam, percent, barra, poder }
}

/**
 * Concede XP ao usuário de forma consistente e estruturada por fonte (grupo, pv, rpg)
 * @param {object} user - Perfil do usuário
 * @param {number} rawAmount - Quantidade bruta de XP
 * @param {object} [options]
 * @param {'group'|'pv'|'rpg'} [options.source='rpg'] - Origem do XP
 * @param {number} [options.maxLevels=50] - Limite de subida de níveis nesta chamada
 * @param {boolean} [options.applyRebirth=true] - Se deve aplicar o multiplicador de Rebirth
 * @returns {{ xpGanho: number, lvlRes: object }}
 */
function adicionarXp(user, rawAmount, options = {}) {
    const { source = 'rpg', maxLevels = 50, applyRebirth = true } = options;
    const amount = Math.max(0, Math.floor(Number(rawAmount) || 0));
    const comRebirth = applyRebirth ? aplicarBonusRebirthXp(user, amount) : amount;
    // Pets lendários multiplicam XP (Hydra: +70%). Aplicado DEPOIS do Rebirth,
    // então os dois se somam de forma multiplicativa — que é o comportamento
    // esperado de um pet de 100 milhões.
    const xpGanho = Math.floor(comRebirth * getPetXpMultiplier(user) * getEquipXpMultiplier(user));

    user.xp = (user.xp || 0) + xpGanho;
    user.weeklyXp = (user.weeklyXp || 0) + xpGanho;

    if (source === 'group') {
        user.xpGroup = (user.xpGroup || 0) + xpGanho;
        user.xp_group = user.xpGroup;
        const progressGroup = calcularLevelDeXpTotal(user.xpGroup);
        user.levelGroup = Math.max(user.levelGroup || 1, progressGroup.level);
        user.level_group = user.levelGroup;
    } else if (source === 'pv') {
        user.xpPv = (user.xpPv || 0) + xpGanho;
        user.xp_pv = user.xpPv;
        const progressPv = calcularLevelDeXpTotal(user.xpPv);
        user.levelPv = Math.max(user.levelPv || 1, progressPv.level);
        user.level_pv = user.levelPv;
    } else {
        // Atividades ativas de RPG (hunt, dungeon, boss, missões, etc.)
        user.xpRpg = (user.xpRpg || 0) + xpGanho;
        user.xp_rpg = user.xpRpg;
        const progressRpg = calcularLevelDeXpTotal(user.xpRpg);
        user.levelRpg = Math.max(user.levelRpg || user.level || 1, progressRpg.level);
        user.level_rpg = user.levelRpg;
    }

    const lvlRes = processarLevelUp(user, { maxLevels });
    return { xpGanho, lvlRes };
}

/**
 * Retorna as missões e atividades ativas recomendadas para o jogador upar de nível
 * @param {object} user - Perfil do usuário
 * @param {string} [prefix='.'] - Prefixo dos comandos
 * @returns {Array<string>}
 */
function getMissoesRecomendadas(user, prefix = '.') {
    const level = user.level || 1;
    const mundo = user.mundo || 'floresta';
    const dungeonFloor = user.dungeonFloor || 1;

    const missoes = [
        `🗺️ \`${prefix}hunt\` ➔ Caçar monstros em *${mundo}* (XP e Loots massivos)`,
        `🏰 \`${prefix}dungeon\` ➔ Explorar Masmorra (*Andar ${dungeonFloor}*) — grande salto de nível`,
        `📜 \`${prefix}missao\` ➔ Cumprir missões diárias com recompensas em dobro`,
        `🐉 \`${prefix}boss criar\` / \`${prefix}raid\` ➔ Encarar Chefes Supremos`,
        `🤺 \`${prefix}duelo @user\` ➔ Duelo PvP na Arena para glória e XP`,
        `💬 Chat comum ➔ XP passivo consistente (5-10 XP com proteção anti-spam)`
    ];

    if (level >= 500) {
        missoes.unshift(`👑 \`${prefix}reencarnar premium\` ➔ *Transcendência Suprema* (Mantém Coins/Inv/Equip)`);
    } else if (level >= 100) {
        missoes.unshift(`🌀 \`${prefix}reencarnar\` ➔ *Ritual de Renascimento* (+25% Dano & XP perpétuo)`);
    }

    return missoes;
}

/** Fontes de XP sugeridas ao usuário (dica de "como ganhar mais XP"). */
function getXpTips(prefix = '.') {
    return [
        `⚔️ \`${prefix}hunt\` / \`${prefix}dungeon\` — caçar e masmorras`,
        `🐉 \`${prefix}boss criar\` / \`${prefix}raid\` — bosses e raids`,
        `🤺 \`${prefix}duelo @user\` — duelar com outros jogadores`,
        `🔨 \`${prefix}forjar\` — forjar e evoluir equipamentos`,
        `💬 Mandar mensagens no grupo (texto, áudio, vídeo) rende XP consistente`
    ]
}

/**
 * Retorna o multiplicador de bônus perpétuo por Rebirth (+25% por grau de renascimento).
 */
/**
 * Multiplicador de XP vindo do EQUIPAMENTO (tier Universal).
 * Soma os percentuais das peças equipadas e aplica uma vez só, para sete peças
 * de +30% darem +210% e não o composto de multiplicar peça a peça.
 * @param {object} user
 * @returns {number} 1 quando nenhuma peça dá XP
 */
function getEquipXpMultiplier(user) {
    const slots = user?.slots
    if (!slots || typeof slots !== 'object') return 1
    let pct = 0
    for (const ref of Object.values(slots)) {
        if (!ref) continue
        const item = typeof ref === 'object' ? ref : getItem(ref)
        if (item?.buffs?.xpPct) pct += item.buffs.xpPct
    }
    return pct ? 1 + (pct / 100) : 1
}

/**
 * Multiplicador de XP vindo do pet equipado.
 * @param {object} user
 * @returns {number} 1 quando não há pet com buff de XP
 */
function getPetXpMultiplier(user) {
    const key = resolvePetKey(user?.pet);
    if (!key) return 1;
    const pct = petsDisponiveis[key]?.buffs?.xpPct;
    return pct ? 1 + (pct / 100) : 1;
}

function getRebirthMultiplier(user) {
    const rebirths = Math.max(0, Number(user?.rebirthCount ?? user?.rebirth_count ?? 0));
    return 1 + (rebirths * 0.25);
}

/**
 * Aplica o bônus de Rebirth (+25% por Rebirth) sobre um valor de XP.
 */
function aplicarBonusRebirthXp(user, baseXp) {
    if (!baseXp || baseXp <= 0) return 0;
    const mult = getRebirthMultiplier(user);
    return Math.floor(baseXp * mult);
}

module.exports = {
    getPetXpMultiplier,
    getEquipXpMultiplier,
    initializeUser,
    getXpProgress,
    getXpTips,
    getMissoesRecomendadas,
    calcularXpNecessario,
    calcularLevelDeXpTotal,
    processarLevelUp,
    adicionarXp,
    barraXP,
    getCargo,
    getRank,
    getRebirthMultiplier,
    aplicarBonusRebirthXp
}
