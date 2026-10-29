/**
 * Fonte única das categorias de comando estratégicas do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤.
 * Consumida pelo gerador de menu dinâmico e pelo dispatcher de comandos.
 *
 * Cada categoria possui:
 * - key: chave canônica do módulo estratégico
 * - emoji: ícone visual representativo
 * - label: título descritivo da categoria
 * - shortcuts: termos que abrem o submenu diretamente (ex: .rpg, .eco, .cassino, .media, etc.)
 */

const CATEGORIES = [
    {
        key: 'rpg',
        emoji: '⚔️',
        label: 'RPG & Combate',
        shortcuts: ['rpg', 'combate', 'aventura', 'slayer', 'raid', 'boss', 'dungeon']
    },
    {
        key: 'economia',
        emoji: '💰',
        label: 'Economia & Banco',
        shortcuts: ['eco', 'economia', 'banco', 'pix', 'investir', 'bancosin']
    },
    {
        key: 'cassino',
        emoji: '🎰',
        label: 'Cassino & Apostas',
        shortcuts: ['cassino', 'aposta', 'apostas', 'roleta', 'slots', 'mines', 'crash', 'plinko', 'bicho']
    },
    {
        key: 'downloads',
        emoji: '📥',
        label: 'Downloads & Mídia',
        shortcuts: ['downloads', 'download', 'media', 'midia', 'musica', 'play', 'ytmp4', 'ytmp3', 'video']
    },
    {
        key: 'figurinhas',
        emoji: '🎨',
        label: 'Figurinhas & Edição',
        shortcuts: ['figurinhas', 'fig', 'figurinha', 'sticker', 'stickers', 'fotos', 'edicao', 'meme']
    },
    {
        key: 'jogos',
        emoji: '🎮',
        label: 'Jogos & Quizzes',
        shortcuts: ['jogos', 'jogo', 'games', 'quiz', 'charada', 'minigames']
    },
    {
        key: 'diversao',
        emoji: '😂',
        label: 'Diversão & Social',
        shortcuts: ['diversao', 'fun', 'social', 'interacao', 'afeto', 'casamento', 'ship']
    },
    {
        key: 'moderacao',
        emoji: '🛡️',
        label: 'Moderação & Segurança',
        shortcuts: ['moderacao', 'admin', 'adm', 'seguranca', 'trava', 'antilink', 'antispam', 'antifake']
    },
    {
        key: 'mensagens-grupo',
        emoji: '📣',
        label: 'Mensagens & Grupos',
        shortcuts: ['grupo', 'grupos', 'mensagens', 'anuncios', 'hidetag', 'tagall', 'enquete', 'sorteio']
    },
    {
        key: 'ia',
        emoji: '🧠',
        label: 'IA & Pesquisa',
        shortcuts: ['ia', 'ai', 'pesquisa', 'gemini', 'gpt', 'chatgpt', 'traduzir']
    },
    {
        key: 'livros',
        emoji: '📚',
        label: 'Livros & Biblioteca',
        shortcuts: ['livros', 'livro', 'biblioteca', 'apostilas', 'ebook', 'gutenberg']
    },
    {
        key: 'utilidades',
        emoji: '🧭',
        label: 'Utilidades & Telefonia',
        shortcuts: ['utilidades', 'util', 'general', 'geral', 'calc', 'calculadora', 'numfake', 'clima', 'cotacao']
    },
    {
        key: 'escola',
        emoji: '🎓',
        label: 'Escola & Estudo',
        shortcuts: ['escola', 'estudo', 'estudar', 'materia', 'materias', 'licao', 'prova', 'enem']
    },
    {
        key: 'ferramentas',
        emoji: '🧰',
        label: 'Ferramentas & Contas',
        shortcuts: ['ferramentas', 'ferramenta', 'converter', 'conversor', 'contas', 'calcular']
    },
    {
        key: 'curiosidades',
        emoji: '💡',
        label: 'Curiosidades',
        shortcuts: ['curiosidades', 'curiosidade', 'fatos', 'sabia', 'voce sabia']
    },
    {
        key: 'texto',
        emoji: '✍️',
        label: 'Texto & Escrita',
        shortcuts: ['texto', 'escrita', 'escrever', 'letras', 'palavras']
    },
    {
        key: 'perfil',
        emoji: '🏆',
        label: 'Perfil, XP & Ranking',
        shortcuts: ['perfil', 'profile', 'rank', 'xp', 'level', 'ranking', 'dossie']
    },
    {
        key: 'dev',
        emoji: '👨‍💻',
        label: 'Dev Hub & Ferramentas',
        shortcuts: ['dev', 'tools', 'software', 'debug', 'sistema', 'ping', 'speedtest']
    },
    {
        key: 'owner',
        emoji: '👑',
        label: 'Donos & Aluguel',
        shortcuts: ['dono', 'donos', 'owner', 'aluguel', 'vps', 'planos', 'modulo', 'cmdglobal']
    },
    {
        key: 'adicional',
        emoji: '⚡',
        label: 'Adicionais & Especiais',
        shortcuts: ['adicional', 'adicionais', 'extra', 'extras', 'especial', 'especiais', 'plus', 'tools2']
    }
]

// Índice: shortcut (lowercase) -> key da categoria
const SHORTCUT_TO_KEY = {}
for (const c of CATEGORIES) {
    SHORTCUT_TO_KEY[c.key] = c.key
    for (const s of c.shortcuts) SHORTCUT_TO_KEY[s] = c.key
}

// Índice: key -> metadados
const BY_KEY = {}
for (const c of CATEGORIES) BY_KEY[c.key] = c

/** Resolve um atalho digitado para a key da categoria, ou null. */
function resolveCategoryKey(input) {
    if (!input) return null
    const clean = String(input).toLowerCase().trim()
    return SHORTCUT_TO_KEY[clean] || null
}

module.exports = { CATEGORIES, BY_KEY, SHORTCUT_TO_KEY, resolveCategoryKey }
