/**
 * Nome de exibição de um membro nas mensagens do grupo. Nunca o número.
 */

const dataService = require('../services/dataService');
const logger = require('../core/logger');

function nomeDoMembro(jid) {
    try {
        const nome = String(dataService.getUser(jid)?.name || '').trim();
        return nome || 'Este membro';
    } catch (err) {
        logger.warn(`[NOME] Não consegui ler o nome de ${jid}: ${err.message}`);
        return 'Este membro';
    }
}

module.exports = { nomeDoMembro };
