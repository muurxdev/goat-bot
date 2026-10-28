/**
 * Módulos ("farms"/blocos) transversais do bot.
 *
 * Diferente de `categories.js` (que espelha as pastas), um MÓDULO agrupa comandos
 * por FUNÇÃO/feature para ligar/desligar em bloco. Todo módulo nasce DESLIGADO
 * (`enabledByDefault: false`) — o dono libera por módulo, por comando (override) ou
 * tudo de uma vez. O estado é resolvido em `moduleStateService.js`.
 *
 * `resolveModuleKey(cmd)` decide o módulo de um comando (override por nome →
 * subcategoria → categoria → fallback).
 */

const MODULES = [
    { key: 'rpg',             emoji: '⚔️',  label: 'RPG & Combate' },
    { key: 'xp',              emoji: '✨',  label: 'XP & Progressão (passivo)' },
    { key: 'economia',        emoji: '💰',  label: 'Economia & Banco' },
    { key: 'cassino',         emoji: '🎰',  label: 'Cassino & Apostas' },
    { key: 'jogos',           emoji: '🎮',  label: 'Jogos' },
    { key: 'diversao',        emoji: '😂',  label: 'Diversão & Social' },
    { key: 'downloads',       emoji: '📥',  label: 'Downloads de Mídia' },
    { key: 'figurinhas',      emoji: '🎨',  label: 'Figurinhas & Edição' },
    { key: 'moderacao',       emoji: '🛡️',  label: 'Moderação' },
    { key: 'mensagens-grupo', emoji: '📣',  label: 'Mensagens & Grupo' },
    { key: 'dev',             emoji: '👨‍💻', label: 'Dev Tools' },
    { key: 'utilidades',      emoji: '🧭',  label: 'Utilidades' },
    // Áreas abertas em 2026-09-17 para desafogar "utilidades", que sozinha
    // respondia por 1.387 dos 3.473 comandos e virava um balaio no menu.
    { key: 'escola',          emoji: '🎓',  label: 'Escola & Estudo' },
    { key: 'ferramentas',     emoji: '🧰',  label: 'Ferramentas & Contas' },
    { key: 'curiosidades',    emoji: '💡',  label: 'Curiosidades' },
    { key: 'texto',           emoji: '✍️',  label: 'Texto & Escrita' },
    { key: 'ia',              emoji: '🧠',  label: 'IA & Pesquisa' },
    { key: 'livros',          emoji: '📚',  label: 'Livros & Materiais' },
    { key: 'perfil',          emoji: '🏆',  label: 'Perfil & Ranking' },
    { key: 'divulgacao',      emoji: '📢',  label: 'Divulgação & Broadcast' },
    { key: 'skycode',         emoji: '🛰️',  label: 'Protocolo & Painel Skycode' },
    { key: 'owner',           emoji: '👑',  label: 'Dono & Bot' },
    { key: 'adicional',       emoji: '⚡',  label: 'Comandos Adicionais & Especiais' }
]

const BY_KEY = {}
for (const m of MODULES) BY_KEY[m.key] = m

// Todo módulo começa desligado por padrão (camada OPT-IN do Dono) para controle restrito.
const DEFAULT_ENABLED = false

// Overrides por NOME de comando (têm prioridade sobre categoria/subcategoria).
// Só precisa listar os transversais que não seguem a categoria.
const NAME_TO_MODULE = {}
const addNames = (key, names) => names.forEach(n => { NAME_TO_MODULE[n] = key })

addNames('skycode', [
    'skycode', 'sky', 'painelskycode', 'skystatus', 'skydiag', 'skychaves',
    'skyauditoria', 'skymodulos', 'skyfila', 'skygrupos'
])

addNames('cassino', [
    'cassino', 'cassinoroyale', 'slots', 'mines', 'crash', 'roleta', 'blackjack',
    'apostar', 'aposta', 'dado', 'dados', 'bingo', 'rifa', 'rifar', 'loteria',
    'megapremio', 'jackpot', 'jogodobicho', 'caraoucoroa', 'plinko', 'dobro',
    'torresorte', 'raspadinha', 'poedeira'
])
addNames('mensagens-grupo', [
    'welcome', 'leave', 'boasvindas', 'despedida', 'agendarmensagem', 'anuncio',
    'anunciooficial', 'hidetag', 'tagall', 'marcar', 'sorteio', 'sorteioavancado',
    'enquete', 'votacao', 'event', 'setrules', 'listaregras', 'setdesc',
    'setnomegrupo', 'setfotogrupo'
])
addNames('ia', ['ia', 'gpt', 'chatgpt', 'gemini', 'imagine', 'dalle', 'ai',
    // Lote 1 IA & Pesquisa (keyless): novos + os de texto/pesquisa já existentes
    'traduzir', 'resumir', 'pesquisar', 'detectaridioma', 'definir',
    'analisartexto', 'corrigir', 'explicar'])
addNames('figurinhas', [
    'fig', 'figurinha', 'sticker', 'take', 'toimg', 'emojimix', 'meme', 'gif',
    'mirror', 'rotate', 'crop', 'resize', 'enhance', 'filter', 'grayscale',
    'threshold', 'emboss', 'sketch', 'oil', 'pixelart', 'blur', 'sepia', 'invert',
    'wanted', 'wasted', 'triggered', 'circle', 'nobg', 'removerbg', 'pixelar'
])
addNames('livros', ['livro', 'livros', 'livroaleatorio', 'apostila', 'apostilas', 'gutenberg',
    // Lote 2 Livros (Open Library, keyless)
    'buscarlivro', 'livrosautor', 'livrogenero', 'capalivro', 'isbn', 'recomendarlivro',
    'autorlivro', 'resumolivro', 'gerarpdf'])
// Módulo oficial de comunicação, parceria e transmissão em massa.
//
// Sobre gestão de LINK (antilink, antispamlink, link): fica em `moderacao`, NÃO
// aqui. Movê-la para cá a tiraria do perfil `completo`, que por definição não
// acende `divulgacao` — o grupo perderia antilink. E não faz falta: o perfil
// `divulgacao` já inclui o módulo `moderacao`, então quem opera divulgação
// continua com todo o controle de link na mão.
addNames('divulgacao', [
    'divulgacao', 'divulgar', 'broadcast', 'transmissao', 'anunciar',
    // Programa de afiliados e cotas de link de parceiros
    'afiliado', 'afiliados', 'linkafiliado', 'permissaolink', 'limitelink', 'cotaslinks',
    // Comunicados e avisos oficiais do grupo
    'anunciooficial', 'comunicado', 'avisoadmin', 'notificacaogrupo'
])

/**
 * Resolve o módulo de um comando.
 * @param {{name?:string, category?:string, subcategory?:string}} cmd
 * @returns {string} chave do módulo
 */
function resolveModuleKey(cmd) {
    if (!cmd) return 'utilidades'
    const name = String(cmd.name || '').toLowerCase()
    if (NAME_TO_MODULE[name]) return NAME_TO_MODULE[name]

    const cat = String(cmd.category || '').toLowerCase()
    const sub = String(cmd.subcategory || '').toLowerCase()

    switch (cat) {
        // Pastas próprias: a categoria já diz a área, sem depender da subcategoria.
        case 'escola':
            return 'escola'
        case 'ferramentas':
            return 'ferramentas'
        case 'curiosidades':
            return 'curiosidades'
        case 'texto':
            return 'texto'
        case 'rpg':
            return 'rpg'
        case 'economy':
            return sub.includes('jog') ? 'cassino' : 'economia'
        case 'fun':
            return (sub.includes('jog') || sub.includes('quiz')) ? 'jogos' : 'diversao'
        case 'media':
            return sub.includes('imag') ? 'figurinhas' : 'downloads'
        case 'dev':
            return 'dev'
        case 'general':
            if (sub.includes('ia') || sub.includes('inteligencia') || sub.includes('consultor') || sub.includes('pesquisa')) return 'ia'
            if (sub.includes('livro') || sub.includes('literatura') || sub.includes('leitura') || sub.includes('biblioteca') || sub.includes('autor')) return 'livros'
            if (sub.includes('historia') || sub.includes('geografia') || sub.includes('mitologia') || sub.includes('astronomia') || sub.includes('planta') || sub.includes('bicho') || sub.includes('biologia')) return 'curiosidades'
            if (sub.includes('unidade') || sub.includes('convers') || sub.includes('calcul') || sub.includes('conta')) return 'ferramentas'
            if (sub.includes('texto') || sub.includes('palavra') || sub.includes('letra') || sub.includes('frase')) return 'texto'
            if (sub.includes('financa') || sub.includes('clt') || sub.includes('trabalho') || sub.includes('banco')) return 'economia'
            if (sub.includes('perfil') || sub.includes('rank')) return 'perfil'
            if (sub.includes('xp') || sub.includes('progressao')) return 'xp'
            return 'utilidades'
        case 'admin':
            // A subcategoria é quem sabe do que o comando trata. Antes só
            // "config" era reconhecido, então famílias inteiras de divulgação e
            // de mensagens caíam em `moderacao` e nunca acendiam com o perfil
            // certo.
            if (sub.includes('divulga') || sub.includes('afilia') || sub.includes('campanha')) return 'divulgacao'
            if (sub.includes('config') || sub.includes('mensagem') || sub.includes('mensagens')) return 'mensagens-grupo'
            return 'moderacao'
        case 'profile':
            return 'perfil'
        case 'owner':
            return 'owner'
        case 'adicional':
            return 'adicional'
        default:
            return 'utilidades'
    }
}

module.exports = { MODULES, BY_KEY, DEFAULT_ENABLED, NAME_TO_MODULE, resolveModuleKey }
