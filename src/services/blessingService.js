/**
 * Bênçãos das Deusas — buffs TEMPORÁRIOS de combate.
 *
 * Os comandos `.bencao1` … `.bencao11` prometiam "+150×N de CP" mas não
 * concediam nada: eram texto de lore. Aqui a promessa vira efeito real,
 * com duração e cooldown.
 *
 * Regras:
 *   - Uma bênção ativa por vez. Invocar outra de grau IGUAL ou MAIOR substitui;
 *     de grau menor é recusado, para não desperdiçar uma bênção forte.
 *   - Enquanto ativa, o bônus entra no characterEngine (CP, ATK, DEF, HP).
 *   - Expirada, some sozinha na próxima leitura — sem job de limpeza.
 *
 * Persistido em `user.blessing = { grau, expira }`.
 */

const logger = require('../core/logger')

/** Grau máximo existente (bencao1 … bencao11). */
const GRAU_MAX = 11

/** CP concedido por grau — mesmo número que a lore dos comandos anuncia. */
const CP_POR_GRAU = 150

/** Duração base + acréscimo por grau. */
const DURACAO_BASE_MS = 30 * 60 * 1000
const DURACAO_POR_GRAU_MS = 10 * 60 * 1000

/**
 * Dados de uma bênção de determinado grau.
 * @param {number} grau 1..GRAU_MAX
 */
function getBlessing(grau) {
    const g = Math.min(GRAU_MAX, Math.max(1, Math.floor(Number(grau) || 1)))
    const cp = CP_POR_GRAU * g
    return {
        grau: g,
        cp,
        // Atributos derivados do CP, para a bênção pesar em combate e não só
        // inflar um número de vitrine.
        atk: Math.floor(cp * 0.35),
        def: Math.floor(cp * 0.30),
        hp: Math.floor(cp * 1.20),
        duracaoMs: DURACAO_BASE_MS + (DURACAO_POR_GRAU_MS * g)
    }
}

/**
 * Bênção ativa do usuário, ou null se não houver / tiver expirado.
 * @param {object} user
 */
function getActiveBlessing(user) {
    const b = user?.blessing
    if (!b || !b.grau || !b.expira) return null
    if (Date.now() >= Number(b.expira)) return null
    return { ...getBlessing(b.grau), expira: Number(b.expira) }
}

/**
 * Bônus agregado da bênção ativa — consumido pelo characterEngine.
 * @returns {{cp:number, atk:number, def:number, hp:number}}
 */
function getBlessingBonus(user) {
    const ativa = getActiveBlessing(user)
    if (!ativa) return { cp: 0, atk: 0, def: 0, hp: 0 }
    return { cp: ativa.cp, atk: ativa.atk, def: ativa.def, hp: ativa.hp }
}

/**
 * Concede uma bênção ao usuário.
 * @param {object} user objeto do usuário (mutado)
 * @param {number} grau
 * @returns {{ok:boolean, motivo?:string, bencao?:object, restanteMs?:number}}
 */
function grantBlessing(user, grau) {
    if (!user || typeof user !== 'object') {
        return { ok: false, motivo: 'Usuário inválido.' }
    }

    const nova = getBlessing(grau)
    const ativa = getActiveBlessing(user)

    if (ativa && ativa.grau > nova.grau) {
        return {
            ok: false,
            motivo: `Você já está sob uma bênção de grau *${ativa.grau}*, mais forte que esta (grau ${nova.grau}).`,
            restanteMs: ativa.expira - Date.now(),
            bencao: ativa
        }
    }

    user.blessing = { grau: nova.grau, expira: Date.now() + nova.duracaoMs }
    logger.info(`[BENCAO] Grau ${nova.grau} concedida (+${nova.cp} CP por ${Math.round(nova.duracaoMs / 60000)} min)`)
    return { ok: true, bencao: { ...nova, expira: user.blessing.expira } }
}

/** Tempo restante formatado, para exibição. */
function formatRestante(ms) {
    const total = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    if (h > 0) return `${h}h ${m}min`
    if (m > 0) return `${m}min`
    return `${total}s`
}

module.exports = {
    GRAU_MAX,
    CP_POR_GRAU,
    getBlessing,
    getActiveBlessing,
    getBlessingBonus,
    grantBlessing,
    formatRestante
}
