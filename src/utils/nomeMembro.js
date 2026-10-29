/**
 * Nome de exibição de um membro nas mensagens do grupo. Nunca o número.
 *
 * Ordem de busca:
 * 1. Registro do usuário no bot (quando ele tem atividade).
 * 2. Mapa jid -> nome em configs.global.nomesMembros (pushName de quem já falou).
 * 3. Metadados do grupo no WhatsApp (notify/name/verifiedName do participante),
 *    mesmo para quem nunca falou no bot. O resultado vai para o mapa do item 2.
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

/** Guarda o nome de um membro. Só grava quando o nome é novo ou mudou. */
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

/** Nome já conhecido (registro do bot ou mapa), sem consultar o WhatsApp. */
function buscarNomeConhecido(jid) {
    try {
        const nome = String(dataService.getUser(jid)?.name || '').trim();
        if (nome) return nome;
    } catch (err) {
        logger.warn(`[NOME] Não consegui ler o usuário ${jid}: ${err.message}`);
    }
    carregarNomes();
    return cacheNomes.get(jid) || null;
}

function nomeDoMembro(jid) {
    return buscarNomeConhecido(jid) || 'Este membro';
}

/** Compara só a parte numérica do identificador (ignora @lid, @s.whatsapp.net e o :device). */
function mesmoMembro(a, b) {
    const base = (j) => String(j || '').split('@')[0].split(':')[0];
    return !!a && !!b && base(a) === base(b);
}

/**
 * Nome do membro, buscando nos metadados do grupo quando o bot ainda não o conhece.
 * Não depende de a pessoa ter falado antes.
 */
async function nomeDoMembroNoGrupo(client, groupJid, jid) {
    const conhecido = buscarNomeConhecido(jid);
    if (conhecido) return conhecido;
    try {
        const meta = await client.groupMetadata(groupJid);
        const participante = (meta?.participants || []).find((p) =>
            mesmoMembro(p.id, jid) || mesmoMembro(p.lid, jid) || mesmoMembro(p.phoneNumber, jid)
        );
        const nome = String(participante?.notify || participante?.name || participante?.verifiedName || '').trim();
        if (nome) {
            lembrarNomeDoMembro(jid, nome);
            return nome;
        }
    } catch (err) {
        logger.warn(`[NOME] Não consegui ler os participantes de ${groupJid}: ${err.message}`);
    }
    return 'Este membro';
}

module.exports = { nomeDoMembro, nomeDoMembroNoGrupo, lembrarNomeDoMembro };
