/**
 * Leitura e escrita de configurações COM ESCOPO.
 *
 * Resolve a precedência num lugar só, em vez de cada arquivo repetir
 * `configs[grupo]?.x || configs.global?.x || padrão` — repetição que já causou
 * opções ficarem só globais por esquecimento.
 *
 * PRECEDÊNCIA (primeira que existir vence):
 *   1. ambiente  → o grupo, ou o JID da pessoa no privado
 *   2. global    → vale para todos
 *   3. padrão    → o do registro em `config/settings.js`
 */

const { SETTING_BY_KEY, resolveSettingKey } = require('../config/settings')
const logger = require('../core/logger')

/** Converte um valor digitado para o tipo declarado da configuração. */
/** Como cada escopo e tipo aparece nas mensagens para o dono. */
const NOME_ESCOPO = { grupo: 'por grupo', pv: 'no privado', global: 'no global' }
const ESPERADO = { bool: 'on ou off', numero: 'um número' }

function coagir(valor, tipo) {
    if (tipo === 'bool') {
        const v = String(valor).toLowerCase().trim()
        if (['on', 'sim', 'true', '1', 'ligar', 'ativar'].includes(v)) return true
        if (['off', 'nao', 'não', 'false', '0', 'desligar', 'desativar'].includes(v)) return false
        return null
    }
    if (tipo === 'numero') {
        const n = Number(valor)
        return Number.isFinite(n) ? n : null
    }
    return String(valor)
}

/**
 * Valor efetivo de uma configuração naquele ambiente, com a origem.
 *
 * A origem importa: sem ela o dono não distingue "está ligado aqui" de "está
 * ligado porque o global está" — e desliga no lugar errado.
 *
 * @param {string} chave
 * @param {string|null} scopeJid JID do grupo, ou do usuário no privado
 * @returns {{valor:any, origem:'ambiente'|'global'|'padrao', setting:object|null}}
 */
function get(chave, scopeJid = null) {
    const k = resolveSettingKey(chave)
    const setting = k ? SETTING_BY_KEY[k] : null
    if (!setting) return { valor: undefined, origem: 'padrao', setting: null }

    try {
        const dataService = require('./dataService')
        const configs = dataService.getConfigsData()

        if (scopeJid && configs[scopeJid] && configs[scopeJid][k] !== undefined) {
            return { valor: configs[scopeJid][k], origem: 'ambiente', setting }
        }
        if (configs.global && configs.global[k] !== undefined) {
            return { valor: configs.global[k], origem: 'global', setting }
        }
    } catch (err) {
        logger.warn(`[SETTINGS] Falha ao ler "${k}" (${err.message}); usando o padrão.`)
    }

    return { valor: setting.padrao, origem: 'padrao', setting }
}

/**
 * Grava uma configuração num escopo.
 * @param {string} chave
 * @param {*} valorBruto valor como o usuário digitou
 * @param {string|null} scopeJid null = global
 * @returns {Promise<{ok:boolean, motivo?:string, valor?:any}>}
 */
async function set(chave, valorBruto, scopeJid = null) {
    const k = resolveSettingKey(chave)
    const setting = k ? SETTING_BY_KEY[k] : null
    if (!setting) return { ok: false, motivo: `Configuração "${chave}" não existe.` }

    const ehGrupo = Boolean(scopeJid && String(scopeJid).endsWith('@g.us'))
    const escopoNome = !scopeJid ? 'global' : (ehGrupo ? 'grupo' : 'pv')
    if (!setting.escopos.includes(escopoNome)) {
        return {
            ok: false,
            motivo: `*${setting.label}* não pode ser ajustado ${NOME_ESCOPO[escopoNome]}. Pode ser ajustado ${setting.escopos.map(e => NOME_ESCOPO[e] || e).join(', ')}.`
        }
    }

    const valor = coagir(valorBruto, setting.tipo)
    if (valor === null) {
        return { ok: false, motivo: `Valor inválido para *${setting.label}*: use ${ESPERADO[setting.tipo] || 'um texto'}.` }
    }

    try {
        const dataService = require('./dataService')
        const configs = dataService.getConfigsData()
        const alvo = scopeJid || 'global'
        if (!configs[alvo]) configs[alvo] = {}
        configs[alvo][k] = valor
        await dataService.saveConfigsData(configs)
        logger.info(`[SETTINGS] "${k}" = ${JSON.stringify(valor)} em ${alvo}`)
        return { ok: true, valor }
    } catch (err) {
        logger.error(`[SETTINGS] Falha ao gravar "${k}": ${err.message}`)
        return { ok: false, motivo: 'Não consegui salvar o ajuste agora. Tente de novo em instantes.' }
    }
}

/**
 * Remove o ajuste do ambiente, voltando a herdar do global/padrão.
 */
async function reset(chave, scopeJid = null) {
    const k = resolveSettingKey(chave)
    if (!k) return { ok: false, motivo: `Configuração "${chave}" não existe.` }
    try {
        const dataService = require('./dataService')
        const configs = dataService.getConfigsData()
        const alvo = scopeJid || 'global'
        if (configs[alvo] && configs[alvo][k] !== undefined) {
            delete configs[alvo][k]
            await dataService.saveConfigsData(configs)
            logger.info(`[SETTINGS] "${k}" removido de ${alvo} (volta a herdar)`)
            return { ok: true }
        }
        return { ok: false, motivo: 'Não havia ajuste próprio neste ambiente.' }
    } catch (err) {
        logger.error(`[SETTINGS] Falha ao remover "${k}": ${err.message}`)
        return { ok: false, motivo: 'Não consegui remover o ajuste agora. Tente de novo em instantes.' }
    }
}

/** Todas as configurações válidas naquele ambiente, com valor e origem. */
function list(scopeJid = null) {
    const ehGrupo = Boolean(scopeJid && String(scopeJid).endsWith('@g.us'))
    const escopoNome = !scopeJid ? 'global' : (ehGrupo ? 'grupo' : 'pv')
    const { SETTINGS } = require('../config/settings')
    return SETTINGS
        .filter(s => s.escopos.includes(escopoNome) || s.escopos.includes('global'))
        .map(s => ({ ...s, ...get(s.chave, scopeJid) }))
}

module.exports = { get, set, reset, list, coagir }
