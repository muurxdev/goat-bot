/**
 * Liga/desliga as reações de ciclo de vida dos comandos.
 *
 * Reação em TODO comando é ótima para quem quer feedback imediato e chata para
 * quem acha poluição — então o comportamento é por ambiente, e não uma decisão
 * global imposta a todos os grupos.
 */

const logger = require('../core/logger')

/** Reações nascem ligadas; cada grupo pode desligar. */
const PADRAO_LIGADO = true

/**
 * As reações estão ligadas neste ambiente?
 * Precedência: ajuste do grupo → global → padrão.
 * @param {string|null} scopeJid
 * @param {boolean} isGroup
 */
function reactionsEnabled(scopeJid = null, isGroup = true) {
    try {
        const dataService = require('./dataService')
        const configs = dataService.getConfigsData()
        if (isGroup && scopeJid && configs[scopeJid]?.reacoes !== undefined) {
            return Boolean(configs[scopeJid].reacoes)
        }
        if (configs.global?.reacoes !== undefined) {
            return Boolean(configs.global.reacoes)
        }
        return PADRAO_LIGADO
    } catch (err) {
        logger.warn(`[REACOES] Falha ao ler estado (${err.message}); assumindo padrão.`)
        return PADRAO_LIGADO
    }
}

/**
 * Liga/desliga as reações.
 * @param {boolean} ligado
 * @param {string|null} scopeJid JID do grupo, ou null para global
 */
async function setReactions(ligado, scopeJid = null) {
    const dataService = require('./dataService')
    const configs = dataService.getConfigsData()
    const valor = Boolean(ligado)

    if (scopeJid && String(scopeJid).endsWith('@g.us')) {
        if (!configs[scopeJid]) configs[scopeJid] = {}
        configs[scopeJid].reacoes = valor
    } else {
        if (!configs.global) configs.global = {}
        configs.global.reacoes = valor
    }

    await dataService.saveConfigsData(configs)
    logger.info(`[REACOES] Reações ${valor ? 'LIGADAS' : 'DESLIGADAS'} em ${scopeJid || 'GLOBAL'}`)
    return valor
}

module.exports = { reactionsEnabled, setReactions, PADRAO_LIGADO }
