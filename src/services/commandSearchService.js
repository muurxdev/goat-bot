/**
 * Serviço de Busca Universal e Catálogo de Comandos
 * Pesquisa instantânea em memória sobre os 10.000 comandos indexados
 */

const path = require('path');
const fs = require('fs');
const logger = require('../core/logger');

let cachedIndex = null;
const INDEX_PATH = path.resolve(__dirname, '..', 'config', 'commandIndex.json');

function getIndex() {
    if (!cachedIndex) {
        try {
            if (fs.existsSync(INDEX_PATH)) {
                cachedIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
            }
        } catch (err) {
            logger.error('[COMMAND SEARCH] Falha ao carregar commandIndex:', err);
        }
    }
    return cachedIndex || { commands: {}, aliases: {} };
}

/**
 * Busca comandos por termo ou palavra-chave
 * @param {string} query Termo de busca
 * @param {number} limit Máximo de resultados
 */
function searchCommands(query, limit = 5) {
    if (!query || typeof query !== 'string') return [];
    const q = query.toLowerCase().trim().replace(/^[.!\/#]/, '');
    if (!q) return [];

    const index = getIndex();
    const results = [];

    // 1. Match exato ou de alias
    if (index.aliases[q]) {
        const canonical = index.aliases[q];
        if (index.commands[canonical]) {
            results.push({ cmd: index.commands[canonical], score: 100, matchType: 'alias_exato' });
        }
    } else if (index.commands[q]) {
        results.push({ cmd: index.commands[q], score: 100, matchType: 'nome_exato' });
    }

    // 2. Varredura por relevância nos comandos indexados
    for (const [cmdName, meta] of Object.entries(index.commands)) {
        if (results.some(r => r.cmd.name.toLowerCase() === cmdName)) continue;

        let score = 0;
        if (cmdName.startsWith(q)) score += 50;
        else if (cmdName.includes(q)) score += 30;

        const desc = (meta.description || '').toLowerCase();
        if (desc.includes(q)) score += 20;

        const sub = (meta.subcategory || '').toLowerCase();
        if (sub.includes(q)) score += 15;

        const cat = (meta.category || '').toLowerCase();
        if (cat.includes(q)) score += 10;

        if (score > 0) {
            results.push({ cmd: meta, score, matchType: 'fuzzy' });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map(r => r.cmd);
}

/**
 * Retorna as estatísticas gerais do catálogo
 */
function getCatalogStats() {
    const index = getIndex();
    const totalCommands = Object.keys(index.commands).length;
    const totalAliases = Object.keys(index.aliases).length;

    const byCategory = {};
    for (const meta of Object.values(index.commands)) {
        const cat = meta.category || 'outros';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    return {
        totalCommands,
        totalAliases,
        totalTriggers: totalCommands + totalAliases,
        byCategory
    };
}

/**
 * Sugestões inteligentes baseadas em intenção comum
 */
const INTENT_TOPICS = {
    musica: ['play', 'ytmp3', 'spotify', 'audio8d', 'bassboost', 'letra'],
    download: ['tiktok', 'insta', 'youtube', 'ytmp4', 'twitter', 'midia'],
    figurinhas: ['s', 'fig', 'qc', 'emojimix', 'toimg', 'attp'],
    dinheiro: ['saldo', 'daily', 'bolsa_carteira', 'empresa_criar', 'imovel_comprar', 'banco_investir', 'blackjack_pro'],
    rpg: ['perfil', 'combate', 'cla_criar', 'forjar_item', 'raid_iniciar', 'montaria_adquirir', 'talento_aprender'],
    jogos: ['quiz', 'quiz_futebol_br', 'jogo_d20', 'jogo_cara_coroa', 'adivinheonumero'],
    escola: ['calc_bhaskara', 'calc_juros_comp', 'tabelaperiodica', 'pais_brasil', 'elem_fe'],
    seguranca: ['seg_antiraid', 'seg_lockdown_grupo', 'antifake', 'antilink', 'ban']
};

function suggestCommands(topic) {
    const t = (topic || '').toLowerCase().trim();
    for (const [key, cmds] of Object.entries(INTENT_TOPICS)) {
        if (key.includes(t) || t.includes(key)) {
            return { topic: key, commands: cmds };
        }
    }
    return { topic: 'geral', commands: ['menu', 'ia', 'buscar_comando', 'perfil', 'saldo', 'play'] };
}

module.exports = {
    searchCommands,
    getCatalogStats,
    suggestCommands
};
