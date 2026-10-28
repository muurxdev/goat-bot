/**
 * Character Engine & Procedural Visual Avatar
 * Responsável por:
 * 1. Renderização visual do Boneco de Emoji com níveis de armadura e equipamentos.
 * 2. Cálculo matemático completo e honesto de atributos, dano explosivo, fogueira, pets e títulos.
 * 3. Mecânica balanceada de Rebirth (Nível 100+ -> Nível 1, Mundo 1, +25% DMG/XP perpétuo).
 */

const { getItem, ITEMS_DB } = require('./rpgEquipmentService');
const { petsDisponiveis, resolvePetKey } = require('../utils/constants');
const { getBlessingBonus } = require('./blessingService');
const logger = require('../core/logger');

const RACES = {
    humano: { id: 'humano', nome: 'Humano', emoji: '🧑', bonusAtk: 10, bonusHp: 50, desc: 'Equilíbrio e rápida evolução' },
    demonio: { id: 'demonio', nome: 'Clã dos Demônios', emoji: '😈', bonusAtk: 40, bonusHp: 120, desc: 'Dano destrutivo e Chamas Negras' },
    deusa: { id: 'deusa', nome: 'Clã das Deusas', emoji: '👼', bonusAtk: 20, bonusHp: 200, desc: 'Alta regeneração e Luz Arcangélica' },
    fada: { id: 'fada', nome: 'Clã das Fadas', emoji: '🧚', bonusAtk: 30, bonusHp: 80, desc: 'Agilidade mágica e telecinese' },
    gigante: { id: 'gigante', nome: 'Clã dos Gigantes', emoji: '🗿', bonusAtk: 50, bonusHp: 350, desc: 'Força bruta e criação da terra' }
};

const ELEMENTS = {
    fogo: { id: 'fogo', nome: 'Fogo do Purgatório', emoji: '🔥', desc: 'Dano contínuo de queimadura' },
    luz: { id: 'luz', nome: 'Luz Celestial', emoji: '✨', desc: 'Penetração de defesa e cura' },
    trevas: { id: 'trevas', nome: 'Trevas Absolutas', emoji: '🌑', desc: 'Roubo de vida e dano crítico' },
    raio: { id: 'raio', nome: 'Relâmpago Sagrado', emoji: '⚡', desc: 'Ataques rápidos e múltiplos' },
    terra: { id: 'terra', nome: 'Criação Terrestre', emoji: '🌍', desc: 'Escudo e defesa inabalável' }
};

/**
 * Renderiza o boneco de emoji customizado com todas as peças visíveis
 */
function renderCharacterAvatar(user, stats = null) {
    const calculatedStats = stats || calculateFullCharacterStats(user);
    const slots = user.slots || {};

    // 1. Cabeça / Elmo
    let headVisual = '👤';
    const helm = slots.capacete ? (typeof slots.capacete === 'object' ? slots.capacete : getItem(slots.capacete)) : null;
    if (helm) {
        if (helm.raridade?.includes('Divino') || helm.raridade?.includes('Mítico')) headVisual = '👑';
        else if (helm.raridade?.includes('Épico')) headVisual = '🪖';
        else headVisual = '🧢';
    }

    // 2. Mãos / Arma & Escudo
    let weaponVisual = '👊';
    const weapon = (slots.arma || user.arma) ? (typeof slots.arma === 'object' ? slots.arma : getItem(slots.arma || user.arma)) : null;
    if (weapon) {
        if (weapon.nome?.includes('Sombria') || weapon.nome?.includes('Lâmina')) weaponVisual = '🗡️';
        else if (weapon.nome?.includes('Machado') || weapon.nome?.includes('Rhitta')) weaponVisual = '🪓';
        else if (weapon.nome?.includes('Espiritual') || weapon.nome?.includes('Lança')) weaponVisual = '🔱';
        else if (weapon.nome?.includes('Martelo') || weapon.nome?.includes('Sagrado')) weaponVisual = '🔨';
        else weaponVisual = '⚔️';
    }

    let shieldVisual = '🛡️';
    const shield = slots.escudo ? (typeof slots.escudo === 'object' ? slots.escudo : getItem(slots.escudo)) : null;
    if (!shield) shieldVisual = '';

    // 3. Tronco / Corpo / Raça
    const raceKey = (user.characterRace || user.character_race || 'humano').toLowerCase();
    const raceInfo = RACES[raceKey] || RACES.humano;
    let bodyEmoji = raceInfo.emoji;

    if (user.classe === 'guerreiro') bodyEmoji = '⚔️';
    else if (user.classe === 'mago') bodyEmoji = '🔮';
    else if (user.classe === 'arqueiro') bodyEmoji = '🏹';
    else if (user.classe === 'curandeiro') bodyEmoji = '💚';
    else if (user.classe === 'ladino') bodyEmoji = '🗡️';
    else if (user.classe === 'paladino') bodyEmoji = '🛡️';
    else if (user.classe === 'necromante') bodyEmoji = '💀';
    else if (user.classe === 'berserker') bodyEmoji = '🪓';
    else if (user.classeLendaria === 'goat_assault') bodyEmoji = '👑😈';
    else if (user.classeLendaria === 'pecado_ira') bodyEmoji = '🐉🧒';
    else if (user.classeLendaria === 'dragonite') bodyEmoji = '🐉';
    else if (user.classeLendaria === 'lordesombras') bodyEmoji = '🌑';
    else if (user.classeLendaria === 'arcanosupremo') bodyEmoji = '✨';
    else if (user.classeLendaria === 'sentinela') bodyEmoji = '🛡️';

    // 4. Aura e Asas (Escala infinita com Rebirths)
    let auraLeft = '✨';
    let auraRight = '✨';
    const rebirths = Number(user.rebirthCount || user.rebirth_count || 0);
    if (rebirths >= 50) {
        auraLeft = '🌌👑⚡';
        auraRight = '⚡👑🌌';
    } else if (rebirths >= 20) {
        auraLeft = '🪐💫';
        auraRight = '💫🪐';
    } else if (rebirths >= 10) {
        auraLeft = '🔥👑🪽';
        auraRight = '🪽👑🔥';
    } else if (rebirths >= 5) {
        auraLeft = '🪽⚡';
        auraRight = '⚡🪽';
    } else if (rebirths >= 1) {
        auraLeft = '🌟';
        auraRight = '🌟';
    }

    // 5. Pernas e Botas
    let feetVisual = '👞';
    const boots = slots.botas ? (typeof slots.botas === 'object' ? slots.botas : getItem(slots.botas)) : null;
    if (boots) {
        if (boots.raridade?.includes('Divino')) feetVisual = '✨👢';
        else feetVisual = '👢';
    }

    // 6. Pet
    let petVisual = '';
    const petKeyVisual = resolvePetKey(user.pet);
    if (petKeyVisual && petsDisponiveis[petKeyVisual]) {
        petVisual = `\n🐾 *Companheiro:* ${petsDisponiveis[petKeyVisual].nome}`;
    }

    const forgeStr = (user.forgeLevel || user.forge_level) ? ` (+${user.forgeLevel || user.forge_level} Forja)` : '';

    let boneco = `     ${headVisual}  ${helm ? `[${helm.nome}]` : '[Sem Elmo]'}\n`;
    boneco += `  ${auraLeft}${bodyEmoji} ${weaponVisual}  [${weapon ? weapon.nome : 'Punhos'}]${shieldVisual ? ` ${shieldVisual}` : ''}\n`;
    boneco += `     ${feetVisual}  [Nível ${user.level || 1}${forgeStr}]${petVisual}`;

    return boneco;
}

/**
 * Calcula os atributos totais do personagem com integração de todos os sistemas
 */
function calculateFullCharacterStats(user) {
    const level = Math.max(1, Number(user.level || 1));
    const slots = user.slots || {};

    let totalAtk = 15 + (level * 6);
    let totalDef = 10 + (level * 4);
    let totalHpMax = 120 + (level * 25);
    let totalCrit = 5;
    let totalEsq = 2;
    let totalBloq = 2;
    let totalCp = 60 + (level * 35);

    // 1. Slots de Equipamentos
    // Buffs percentuais (tier Universal) sao ACUMULADOS aqui e aplicados uma
    // unica vez depois do laco: aplicar peca a peca faria a 2a multiplicar o
    // resultado da 1a, e sete pecas de +25% virariam +377% em vez de +175%.
    let buffDanoPct = 0;
    let buffDefPct = 0;
    let buffCritPct = 0;

    for (const slotKey of Object.keys(slots)) {
        const itemRef = slots[slotKey];
        if (itemRef) {
            const item = typeof itemRef === 'object' ? itemRef : getItem(itemRef);
            if (item) {
                totalAtk += (item.atk || 0);
                totalDef += (item.def || 0);
                totalHpMax += (item.hp || 0);
                totalCrit += (item.crit || 0);
                totalEsq += (item.esq || 0);
                totalBloq += (item.bloq || 0);
                totalCp += (item.cp || 0);

                if (item.buffs) {
                    buffDanoPct += (item.buffs.danoPct || 0);
                    buffDefPct += (item.buffs.defPct || 0);
                    buffCritPct += (item.buffs.critPct || 0);
                }
            }
        }
    }

    if (buffDanoPct) totalAtk = Math.floor(totalAtk * (1 + buffDanoPct / 100));
    if (buffDefPct) totalDef = Math.floor(totalDef * (1 + buffDefPct / 100));
    if (buffCritPct) totalCrit += buffCritPct;

    // Fallback arma legada
    if (!slots.arma && user.arma) {
        const legacy = getItem(user.arma);
        if (legacy) {
            totalAtk += legacy.atk || 0;
            totalDef += legacy.def || 0;
            totalHpMax += legacy.hp || 0;
            totalCp += legacy.cp || 0;
        }
    }

    // Suporte a itens legados em user.equipado
    if (user.equipado) {
        if (user.equipado === '⚔️ Espada de Bug') totalAtk += 150;
        if (user.equipado === '🔱 Lança do Void') totalAtk += 300;
        if (user.equipado === '🔥 Espada Flamejante') totalAtk += 250;
        if (user.equipado === '🐉 Pulseira Dracônica') totalAtk += 400;
        if (user.equipado === '👑 Coroa do Poder Supremo') totalAtk += 500;
        if (user.equipado === '🌑 Manto das Sombras') totalAtk += 200;
        if (user.equipado === '🛡️ Armadura de Firewall') totalDef += 25;
        if (user.equipado === '🔐 Armadura Criptografada') totalDef += 80;
        if (user.equipado === '⏳ Escudo Temporal') totalDef += 120;
    }

    // 2. Nível de Forja / Refinamento Aprimorado (+50 ATK, +35 DEF, +120 HP, +250 CP)
    const forgeLevel = Math.max(0, Number(user.forgeLevel || user.forge_level || 0));
    if (forgeLevel > 0) {
        totalAtk += forgeLevel * 50;
        totalDef += forgeLevel * 35;
        totalHpMax += forgeLevel * 120;
        totalCp += forgeLevel * 250;
    }

    // 3. Raça
    const raceKey = (user.characterRace || user.character_race || 'humano').toLowerCase();
    const race = RACES[raceKey] || RACES.humano;
    totalAtk += race.bonusAtk;
    totalHpMax += race.bonusHp;

    // 4. Rebirths (+25% Dano e +25% Atributos por Rebirth - Progressão Infinita)
    const rebirths = Math.max(0, Number(user.rebirthCount || user.rebirth_count || 0));
    const rebirthMultiplier = 1 + (rebirths * 0.25);
    totalAtk = Math.floor(totalAtk * rebirthMultiplier);
    totalDef = Math.floor(totalDef * rebirthMultiplier);
    totalHpMax = Math.floor(totalHpMax * rebirthMultiplier);
    totalCp = Math.floor(totalCp * rebirthMultiplier);

    // 5. Pets Ativos
    // resolvePetKey normaliza os 3 formatos historicos de `user.pet`; antes disso
    // so o pet salvo como chave crua aplicava bonus, e os demais ficavam decorativos.
    const petKey = resolvePetKey(user.pet);
    if (petKey && petsDisponiveis[petKey]) {
        const p = petsDisponiveis[petKey];
        if (p.tipo === 'dano') totalAtk += (p.valor || 100);
        else if (p.tipo === 'critico') totalCrit += 15;

        // Buffs percentuais (pets lendarios, ex.: Hydra). Aplicados DEPOIS dos
        // bonus fixos, para multiplicarem o total ja formado.
        if (p.buffs) {
            if (p.buffs.danoPct) totalAtk = Math.floor(totalAtk * (1 + p.buffs.danoPct / 100));
            if (p.buffs.critPct) totalCrit += p.buffs.critPct;
            if (p.buffs.defPct) totalDef = Math.floor(totalDef * (1 + p.buffs.defPct / 100));
        }
    }

    // 5.05 Árvore de habilidade — o que o jogador ESCOLHEU.
    //
    // Vem depois dos bônus fixos e antes das bênçãos, para multiplicar o total
    // já formado por equipamento e pet. Sem isto a árvore seria decorativa: o
    // jogador gastaria pontos e não veria diferença nenhuma no combate.
    try {
        const { bonusDe } = require('./skillTreeService');
        const hab = bonusDe(user);
        if (hab.atkPct) totalAtk = Math.floor(totalAtk * (1 + hab.atkPct / 100));
        if (hab.defPct) totalDef = Math.floor(totalDef * (1 + hab.defPct / 100));
        if (hab.hpPct) totalHpMax = Math.floor(totalHpMax * (1 + hab.hpPct / 100));
        if (hab.critPct) totalCrit += hab.critPct;
        if (hab.esqPct) totalEsq += hab.esqPct;
        if (hab.bloqPct) totalBloq += hab.bloqPct;
    } catch (err) {
        logger.warn(`[PERSONAGEM] Bônus de habilidade indisponível: ${err.message}`);
    }

    // 5.1 Bênção ativa (temporária) — os comandos .bencao1..11 anunciavam CP
    // mas não concediam nada; agora o bônus é real enquanto durar.
    const bencao = getBlessingBonus(user);
    if (bencao.cp) {
        totalAtk += bencao.atk;
        totalDef += bencao.def;
        totalHpMax += bencao.hp;
        totalCp += bencao.cp;
    }

    // 6. Runas Ativas
    const runes = Array.isArray(user.activeRunes || user.active_runes) ? (user.activeRunes || user.active_runes) : [];
    for (const rune of runes) {
        if (rune.atk) totalAtk += rune.atk;
        if (rune.def) totalDef += rune.def;
        if (rune.crit) totalCrit += rune.crit;
        if (rune.hp) totalHpMax += rune.hp;
    }

    // 7. Buff de Fogueira Ativo (+20% ATK temporário)
    const fogueiraExp = Number(user.fogueiraBuffExpira || user.fogueira_buff_expira || 0);
    const hasFogueira = fogueiraExp > Date.now();
    if (hasFogueira) {
        totalAtk = Math.floor(totalAtk * 1.20);
    }

    // 8. Excedente acima dos tetos vira dano, em vez de sumir.
    //
    // Os tetos existem para o combate não virar 100% de crítico, mas quem
    // comprou a HYDRA por 100 milhões (+50% de crítico) e já estava no teto
    // não via diferença nenhuma — o bônus era descartado em silêncio. Agora
    // cada ponto acima do teto vira 1% de ataque, então o investimento sempre
    // aparece em algum lugar.
    const TETO_CRIT = 85, TETO_ESQ = 65, TETO_BLOQ = 80;
    const excedenteCrit = Math.max(0, totalCrit - TETO_CRIT);
    const excedenteEsq = Math.max(0, totalEsq - TETO_ESQ);
    const excedenteBloq = Math.max(0, totalBloq - TETO_BLOQ);
    const excedenteTotal = excedenteCrit + excedenteEsq + excedenteBloq;

    if (excedenteTotal > 0) {
        totalAtk = Math.floor(totalAtk * (1 + excedenteTotal / 100));
    }

    return {
        atk: totalAtk,
        def: totalDef,
        hpMax: totalHpMax,
        crit: Math.min(TETO_CRIT, totalCrit),
        esq: Math.min(TETO_ESQ, totalEsq),
        bloq: Math.min(TETO_BLOQ, totalBloq),
        // Guardados para o perfil poder mostrar que o excedente não sumiu.
        critBruto: totalCrit,
        esqBruto: totalEsq,
        bloqBruto: totalBloq,
        excedenteConvertido: excedenteTotal,
        cp: totalCp,
        rebirths,
        rebirthMultiplier,
        hasFogueira,
        race: race.nome,
        element: (user.characterElement || user.character_element || 'Fogo')
    };
}

/**
 * Informações e regras de Rebirth
 */
function getRebirthInfo(user) {
    const rebirths = Math.max(0, Number(user.rebirthCount ?? user.rebirth_count ?? 0));
    const level = Number(user.level || 1);
    const requiredLevel = 100;
    const canRebirth = level >= requiredLevel;
    const isMaxRebirth = false;

    return {
        rebirths,
        maxRebirths: '∞',
        requiredLevel,
        currentLevel: level,
        canRebirth,
        isMaxRebirth,
        bonusDmgPercent: rebirths * 25,
        bonusXpPercent: rebirths * 25,
        nextBonusDmgPercent: (rebirths + 1) * 25
    };
}

/**
 * Fonte ÚNICA de verdade do HP para exibição e combate.
 *
 * Antes existiam DOIS máximos brigando: o `user.hpMax` salvo pelo xpService
 * (100 + 15/nível) e o do personagem completo aqui (nível + equipamento + forja +
 * raça × rebirth). As telas misturavam os dois e o HP saía errado.
 * Além disso `user.hp || max` mostrava vida CHEIA para quem estava com 0.
 *
 * @param {object} user
 * @returns {{atual:number, max:number, percent:number, barra:string}}
 */
function resolveHp(user) {
    const stats = calculateFullCharacterStats(user || {});
    const max = Math.max(1, Math.floor(stats.hpMax || 100));
    const bruto = Number(user && user.hp);
    // 0 continua 0 (morto) — só cai para o máximo quando não há valor definido.
    const atual = Number.isFinite(bruto) ? Math.max(0, Math.min(max, Math.floor(bruto))) : max;
    const percent = Math.round((atual / max) * 100);
    const cheios = Math.max(0, Math.min(10, Math.round(percent / 10)));
    const barra = '🟩'.repeat(cheios) + '⬛'.repeat(10 - cheios);
    return { atual, max, percent, barra };
}

module.exports = {
    RACES,
    ELEMENTS,
    renderCharacterAvatar,
    calculateFullCharacterStats,
    getRebirthInfo,
    resolveHp
};

