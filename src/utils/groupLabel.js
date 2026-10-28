/**
 * Rótulo legível de um ambiente (grupo, privado ou global).
 *
 * Existe para que comandos de gestão não despejem JID cru na tela: ler
 * "Grupo 120363425006400341@g.us" não diz nada a quem está operando o bot.
 */

const logger = require('../core/logger')

/**
 * Resolve o nome (subject) de um grupo pelo JID.
 *
 * Falha em silêncio DE PROPÓSITO: se os metadados não vierem (bot sem o grupo
 * em cache, sem permissão, offline), quem chama cai no JID, que ainda
 * identifica o ambiente. Um nome bonito não vale derrubar o comando.
 *
 * @param {string} scope JID do grupo
 * @param {string} [origem] etiqueta de quem chamou, só para o log
 * @returns {Promise<string|null>} nome do grupo, ou null
 */
async function resolveGroupName(scope, origem = 'GROUP LABEL') {
    if (!scope || !String(scope).endsWith('@g.us')) return null
    try {
        const groupAuth = require('../services/groupAuthService')
        const info = await groupAuth.getGroupData(scope)
        const nome = info?.data?.subject
        return (typeof nome === 'string' && nome.trim()) ? nome.trim() : null
    } catch (err) {
        logger.warn(`[${origem}] Não foi possível resolver o nome do grupo ${scope}: ${err.message}`)
        return null
    }
}

module.exports = { resolveGroupName }
