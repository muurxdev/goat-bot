/**
 * Resolução de subcategoria de um comando, em 3 níveis:
 *   1. cmd.subcategory declarado no próprio arquivo (comandos novos)
 *   2. mapa central commandTaxonomy.js (legado, gerado do menu antigo)
 *   3. fallback por categoria (DEFAULT_BY_CATEGORY)
 */

let TAXONOMY = {}
try { TAXONOMY = require('../config/commandTaxonomy') } catch (_) { TAXONOMY = {} }

const DEFAULT_BY_CATEGORY = {
    rpg: '⚔️ RPG & COMBATES',
    economy: '💰 ECONOMIA & CASSINO',
    media: '📥 DOWNLOADS & MÍDIA',
    fun: '🎮 DIVERSÃO & JOGOS',
    dev: '👨‍💻 DEV HUB & FERRAMENTAS',
    general: '🧭 UTILIDADES & GERAL',
    admin: '🛡️ ADMINISTRAÇÃO',
    profile: '🏆 PERFIL & RANKING',
    owner: '👑 DONOS & ALUGUEL',
    adicional: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    escola: '🎓 ESCOLA & CONHECIMENTO',
    ferramentas: '🧰 FERRAMENTAS & CONTAS',
    curiosidades: '💡 CURIOSIDADES & FATOS',
    texto: '✍️ TEXTO & ESCRITA',
    ia: '🧠 IA & PESQUISA INTELIGENTE',
    livros: '📚 LIVROS & BIBLIOTECA'
}

/** @returns {string} título da subcategoria do comando */
function resolveSubcategory(cmd) {
    if (!cmd) return 'Outros'
    if (cmd.subcategory) return cmd.subcategory

    // tenta pelo nome e depois por cada alias (o menu antigo às vezes citava alias)
    const name = (cmd.name || '').toLowerCase()
    if (TAXONOMY[name]) return TAXONOMY[name]
    if (Array.isArray(cmd.aliases)) {
        for (const a of cmd.aliases) {
            const key = String(a).toLowerCase()
            if (TAXONOMY[key]) return TAXONOMY[key]
        }
    }

    return DEFAULT_BY_CATEGORY[cmd.category] || 'Outros'
}

module.exports = { resolveSubcategory, DEFAULT_BY_CATEGORY }
