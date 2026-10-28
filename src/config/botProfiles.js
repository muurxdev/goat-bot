/**
 * PERFIS E HIERARQUIA DE ATUAÇÃO DO BOT.
 *
 * Módulos são organizados em uma HIERARQUIA ESTRITA de 3 Árvores Principais:
 *   1. 🛰️ Skycode     → Engenharia, Dev Tools, Livros, Utilidades, Escola, Ferramentas e Texto.
 *   2. 📢 Divulgação   → Divulgação, Transmissão, Afiliados, Moderação e Mensagens de Grupo.
 *   3. 🔓 Liberado     → Todos os comandos e módulos proibíveis (Cassino, RPG, Economia, Jogos, etc.).
 *
 * REGRA FUNDAMENTAL:
 * - Árvores são ISOLADAS: Ativar um pai NUNCA ativa módulos de outra árvore (ex.: divulgação NÃO liga skycode).
 * - Ativação em CASCATA: Ao ativar o "pai", todos os submódulos filhos específicos daquela árvore são ativados.
 * - Modo Divulgação: Liga automaticamente o módulo moderação e ativa o anti-link universal no grupo.
 */

const { MODULES } = require('./modules')

const TODAS_AS_CHAVES = MODULES.map(m => m.key)

/** Só do dono — protegidos por `ownerOnly`, não entram em perfil nenhum. */
const FORA_DE_PERFIL = ['owner']

const TODOS_MENOS_DONO = TODAS_AS_CHAVES.filter(k => !FORA_DE_PERFIL.includes(k))

/**
 * Definição canônica das 3 Árvores Hierárquicas Principais
 */
const HIERARCHY_TREES = {
    skycode: {
        key: 'skycode',
        label: 'Skycode & Engenharia',
        emoji: '🛰️',
        tema: 'código e conhecimento técnico',
        parent: 'skycode',
        children: ['skycode', 'dev', 'livros', 'utilidades', 'escola', 'ferramentas', 'texto'],
        description: 'Protocolo Skycode, dev tools, ferramentas de código, livros e utilidades técnicas.'
    },
    divulgacao: {
        key: 'divulgacao',
        label: 'Divulgação & Moderação',
        emoji: '📢',
        tema: 'divulgação e proteção conjunta',
        parent: 'divulgacao',
        children: ['divulgacao', 'moderacao', 'mensagens-grupo'],
        description: 'Modo divulgação com moderação ligada junto. Anti-link ativo, transmissões, parcerias e proteção do grupo.'
    },
    liberado: {
        key: 'liberado',
        label: 'Liberado',
        emoji: '🔓',
        tema: 'completo & irrestrito',
        parent: 'liberado',
        children: TODOS_MENOS_DONO,
        description: 'Tudo liberado: todos os comandos proibíveis, cassino, apostas, RPG, downloads, jogos e diversão sem travas.'
    }
}

// Aliases e arrays legados preservados para compatibilidade
const SECAO_DEV = HIERARCHY_TREES.skycode.children
const SECAO_DIVULGACAO = HIERARCHY_TREES.divulgacao.children
const SECAO_RPG = ['rpg', 'cassino', 'economia', 'jogos', 'diversao']
const COMUM = TODOS_MENOS_DONO

const PROFILES = [
    {
        key: 'skycode',
        emoji: HIERARCHY_TREES.skycode.emoji,
        label: HIERARCHY_TREES.skycode.label,
        tema: HIERARCHY_TREES.skycode.tema,
        description: HIERARCHY_TREES.skycode.description,
        modules: HIERARCHY_TREES.skycode.children
    },
    {
        key: 'divulgacao',
        emoji: HIERARCHY_TREES.divulgacao.emoji,
        label: HIERARCHY_TREES.divulgacao.label,
        tema: HIERARCHY_TREES.divulgacao.tema,
        description: HIERARCHY_TREES.divulgacao.description,
        modules: HIERARCHY_TREES.divulgacao.children
    },
    {
        key: 'liberado',
        emoji: HIERARCHY_TREES.liberado.emoji,
        label: HIERARCHY_TREES.liberado.label,
        tema: HIERARCHY_TREES.liberado.tema,
        description: HIERARCHY_TREES.liberado.description,
        modules: HIERARCHY_TREES.liberado.children
    }
]

const PROFILE_BY_KEY = {}
for (const p of PROFILES) PROFILE_BY_KEY[p.key] = p

/** Apelidos aceitos na hora de escolher o perfil ou hierarquia. */
const ALIASES = {
    skycode: 'skycode', sky: 'skycode', code: 'skycode', codigo: 'skycode', dev: 'skycode', engenharia: 'skycode',
    divulgacao: 'divulgacao', divulgar: 'divulgacao', broadcast: 'divulgacao', anuncio: 'divulgacao', parceria: 'divulgacao',
    liberado: 'liberado', completo: 'liberado', tudo: 'liberado', full: 'liberado', goat: 'liberado', irrestrito: 'liberado'
}

/**
 * Resolve a chave canônica de um perfil a partir do que o usuário digitou.
 * @param {string} entrada
 * @returns {string|null} chave canônica, ou null se não reconhecida
 */
function resolveProfileKey(entrada) {
    const bruto = String(entrada || '').toLowerCase().trim().replace(/[^a-z]/g, '')
    if (!bruto) return null
    if (PROFILE_BY_KEY[bruto]) return bruto
    return ALIASES[bruto] || null
}

/**
 * A que seção e hierarquia um módulo pertence, com o perfil que o acende.
 *
 * @param {string} moduleKey chave do módulo
 * @returns {{ secao: string, emoji: string, perfil: string|null, pai: string|null }}
 */
function secaoDoModulo(moduleKey) {
    const k = String(moduleKey || '').toLowerCase()
    if (k === 'owner') return { secao: 'Só do Dono', emoji: '👑', perfil: null, pai: null }
    if (HIERARCHY_TREES.skycode.children.includes(k)) {
        return { secao: 'Skycode & Engenharia', emoji: '🛰️', perfil: 'skycode', pai: 'skycode' }
    }
    if (HIERARCHY_TREES.divulgacao.children.includes(k)) {
        return { secao: 'Divulgação & Moderação', emoji: '📢', perfil: 'divulgacao', pai: 'divulgacao' }
    }
    return { secao: 'Liberado (Entretenimento & Geral)', emoji: '🔓', perfil: 'liberado', pai: 'liberado' }
}

/** Em quais perfis um módulo aparece. Usado pelo `.modulo` para explicar. */
function perfisComModulo(moduleKey) {
    const k = String(moduleKey || '').toLowerCase()
    return PROFILES.filter(p => p.modules.includes(k)).map(p => p.key)
}

module.exports = {
    HIERARCHY_TREES,
    PROFILES,
    PROFILE_BY_KEY,
    ALIASES,
    resolveProfileKey,
    secaoDoModulo,
    perfisComModulo,
    COMUM,
    SECAO_DEV,
    SECAO_DIVULGACAO,
    SECAO_RPG,
    TODOS_MENOS_DONO
}
