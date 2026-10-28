/**
 * Motor de Combate Avançado & Balanceamento Matemático MMORPG
 * Unifica cálculos de ataque, defesa, acertos críticos, esquivas, bloqueios,
 * slots de equipamentos, forja, runas, raças, classes, poções, pets e rebirths.
 */

const { pocoes, petsDisponiveis } = require('../utils/constants');
const { calculateFullCharacterStats } = require('./characterEngine');

// Multiplicador do acerto crítico. Exportado para que as fichas mostrem o mesmo
// número que o combate usa — o .statuscompleto exibia "undefined%" porque lia
// um campo que nunca foi calculado.
const CRIT_MULT_MIN = 1.75;
const CRIT_MULT_MAX = 2.25;

/**
 * Calcula o dano de ataque de um jogador com balanceamento matemático integral
 * @param {object} player - Perfil do jogador
 * @param {object} target - Alvo (boss, monstro ou outro jogador)
 * @returns {object} { danoFinal, isCritico, isDobro, efeitoAplicado }
 */
function calcularDanoPlayer(player, target = {}) {
    // 1. Obtenção dos atributos consolidados reais do personagem
    const stats = calculateFullCharacterStats(player);
    let dano = stats.atk;
    let isCritico = false;
    let isDobro = false;

    // 2. Variação natural de combate (±10%)
    const variacao = 0.90 + (Math.random() * 0.20);
    dano = Math.floor(dano * variacao);

    // 3. Verificação de Acerto Crítico (Baseado no stats.crit%)
    const rollCrit = Math.random() * 100;
    if (rollCrit <= stats.crit) {
        isCritico = true;
        const critMult = CRIT_MULT_MIN + (Math.random() * (CRIT_MULT_MAX - CRIT_MULT_MIN));
        dano = Math.floor(dano * critMult);
    }

    // 4. Passivas de Classe Básica
    const classe = (player.classe || 'nenhuma').toLowerCase();
    switch (classe) {
        case 'guerreiro':
            dano = Math.floor(dano * 1.20);
            // Passa pelo xpService para o XP da passiva também subir de nível.
            // Require preguiçoso: evita ciclo de carga entre os motores.
            require('./xpService').adicionarXp(player, 15, { source: 'rpg' });
            break;
        case 'mago':
            dano = Math.floor(dano * 1.30);
            if (Math.random() < 0.20) {
                dano = Math.floor(dano * 1.50);
                isDobro = true;
            }
            break;
        case 'arqueiro':
            dano = Math.floor(dano * 1.25);
            if (Math.random() < 0.15) {
                dano = Math.floor(dano * 1.80);
                isCritico = true;
            }
            break;
        case 'curandeiro':
            dano = Math.floor(dano * 1.10);
            player.hp = Math.min((player.hpMax || 100), (player.hp || player.hpMax || 100) + 30);
            break;
        case 'ladino':
            dano = Math.floor(dano * 1.35);
            if (Math.random() < 0.20) {
                dano = Math.floor(dano * 2.0);
                isCritico = true;
            }
            break;
        case 'paladino':
            dano = Math.floor(dano * 1.15);
            break;
        case 'necromante':
            dano = Math.floor(dano * 1.25);
            const drenar = Math.floor(dano * 0.15);
            player.hp = Math.min((player.hpMax || 100), (player.hp || player.hpMax || 100) + drenar);
            break;
        case 'berserker':
            const hpPercent = (player.hp || player.hpMax || 100) / (player.hpMax || 100);
            const bonusFuria = Math.floor(dano * (1 - hpPercent) * 0.8);
            dano = Math.floor(dano * 1.40) + bonusFuria;
            break;
    }

    // 5. Passivas de Classe Lendária
    const lendaria = (player.classeLendaria || '').toLowerCase();
    if (lendaria) {
        switch (lendaria) {
            case 'pecado_ira':
                dano = Math.floor(dano * 1.50);
                if (Math.random() < 0.25) {
                    dano = Math.floor(dano * 2.0);
                    isCritico = true;
                }
                break;
            case 'goat_assault':
                dano = Math.floor(dano * 1.80);
                if (Math.random() < 0.30) {
                    dano = Math.floor(dano * 2.2);
                    isDobro = true;
                    isCritico = true;
                }
                break;
            case 'dragonite':
            case 'arcanosupremo':
                dano = Math.floor(dano * 1.60);
                break;
            case 'lordesombras':
            case 'sentinela':
                dano = Math.floor(dano * 1.40);
                break;
            default:
                dano = Math.floor(dano * 1.25);
                break;
        }
    }

    // 6. Bônus de Poção Ativa
    const potTipo = player.pocaoAtiva?.tipo || player.pocao_ativa_tipo;
    const potExpira = player.pocaoAtiva?.expira || player.pocao_ativa_expira;
    if (potTipo && (!potExpira || Date.now() < potExpira)) {
        const pot = pocoes[potTipo];
        if (pot && pot.dano) {
            dano = Math.floor(dano * (1 + pot.dano));
        }
    }

    // 7. Modificadores do Alvo / Boss
    if (target && target.efeito) {
        if (target.efeito === 'defesa') {
            dano = Math.floor(dano * 0.80); // Redução de 20%
        }
        if (target.efeito === 'duplicar' && Math.random() < 0.20) {
            dano = Math.floor(dano * 1.75);
        }
    }

    dano = Math.max(10, Math.floor(dano));

    return {
        danoFinal: dano,
        isCritico,
        isDobro
    };
}

/**
 * Calcula a mitigação justa de dano sofrido pelo jogador baseada na DEF e Bloqueio
 * @param {object} player - Perfil do jogador
 * @param {number} danoRecebido - Dano bruto do monstro ou boss
 * @returns {object} { danoMitigado, esquivou, bloqueou }
 */
function calcularDanoSofrido(player, danoRecebido) {
    const stats = calculateFullCharacterStats(player);
    let dano = danoRecebido;
    let esquivou = false;
    let bloqueou = false;

    // Suporte a mitigação direta de itens legados
    if (player.equipado === '🛡️ Armadura de Firewall') {
        dano = Math.max(0, dano - 10);
    } else if (player.equipado === '🔐 Armadura Criptografada') {
        dano = Math.max(0, dano - 100);
    } else if (player.equipado === '⏳ Escudo Temporal') {
        dano = Math.max(0, dano - 150);
    } else {
        // 1. Verificação de Esquiva (Requer botas ou agilidade)
        if (player.slots?.botas || stats.esq > 5) {
            const rollEsq = Math.random() * 100;
            if (rollEsq <= stats.esq) {
                return { danoMitigado: 0, esquivou: true, bloqueou: false };
            }
        }

        // 2. Verificação de Bloqueio (Requer escudo equipado)
        if (player.slots?.escudo || stats.bloq > 5) {
            const rollBloq = Math.random() * 100;
            if (rollBloq <= stats.bloq) {
                bloqueou = true;
                dano = Math.floor(dano * 0.50);
            }
        }

        // 3. Mitigação Curva Assintótica pela Defesa Total Real
        const hasArmorOrLevels = player.slots || (player.level && player.level > 1) || player.forgeLevel || player.arma;
        if (hasArmorOrLevels && stats.def > 15) {
            const defMultiplier = 400 / (400 + Math.max(0, stats.def));
            dano = Math.floor(dano * defMultiplier);
        }
    }

    return {
        danoMitigado: Math.max(1, Math.floor(dano)),
        esquivou,
        bloqueou
    };
}

module.exports = {
    calcularDanoPlayer,
    calcularDanoSofrido,
    CRIT_MULT_MIN,
    CRIT_MULT_MAX
};
