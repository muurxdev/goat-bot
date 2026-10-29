/**
 * Nome de exibição de um membro nas mensagens do grupo. Nunca o número.
 *
 * Fonte 1: o registro do usuário (quando ele tem atividade no bot).
 * Fonte 2: mapa jid -> nome guardado em configs.global.nomesMembros, preenchido
 * com o pushName da primeira mensagem de cada pessoa (mesmo sem atividade).
 */

const dataService = require('../services/dataService');
const logger = require('../core/logger');

const cacheNomes = new Map();
let carregado = false;

function carregarNomes() {
    if (carregado) return;
    carregado = true;
    try {
        const nomes = dataService.getConfigsData()?.global?.nomesMembros || {};
        for (const [jid, nome] of Object.entries(nomes)) cacheNomes.set(jid, nome);
    } catch (err) {
        logger.warn(`[NOME] Não consegui carregar os nomes dos membros: ${err.message}`);
    }
}

/** Guarda o pushName de quem falou. Só grava quando o nome é novo ou mudou. */
function lembrarNomeDoMembro(jid, nome) {
    const limpo = String(nome || '').trim();
    if (!jid || !limpo) return;
    carregarNomes();
    if (cacheNomes.get(jid) === limpo) return;
    cacheNomes.set(jid, limpo);
    try {
        const configs = dataService.getConfigsData();
        configs.global = configs.global || {};
        configs.global.nomesMembros = Object.fromEntries(cacheNomes);
        Promise.resolve(dataService.saveConfigsData(configs)).catch((err) => {
            logger.warn(`[NOME] Falha ao gravar o nome de ${jid}: ${err.message}`);
        });
    } catch (err) {
        logger.warn(`[NOME] Falha ao guardar o nome de ${jid}: ${err.message}`);
    }
}

function nomeDoMembro(jid) {
    try {
        const nome = String(dataService.getUser(jid)?.name || '').trim();
        if (nome) return nome;
    } catch (err) {
        logger.warn(`[NOME] Não consegui ler o usuário ${jid}: ${err.message}`);
    }
    carregarNomes();
    return cacheNomes.get(jid) || 'Este membro';
}

module.exports = { nomeDoMembro, lembrarNomeDoMembro };
