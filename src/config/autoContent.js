/**
 * CONTEÚDO AUTOMÁTICO — temas e o que cada um entrega.
 *
 * O tema é deduzido do NOME do grupo: "SkyCode Studios" recebe livro de
 * programação, "SkyCode: Train languages" recebe material de idioma, um grupo
 * de mídia recebe música. Sem isso o dono teria que configurar tema por tema
 * em dez grupos.
 *
 * A dedução é só o palpite inicial — o dono sobrescreve com
 * `.auto tema <chave>` quando o nome não disser nada.
 */

const TEMAS = [
    // ORDEM IMPORTA: o mais específico primeiro. "SkyCode" está no nome de
    // quase todo grupo desta casa, então se `dev` viesse antes ele engoliria
    // "Projeto RPG (SkyCode)" e "SkyCode: Train languages". O tema do assunto
    // vence o nome da casa; `dev` é o fallback dos genéricos.
    {
        chave: 'idiomas',
        emoji: '🌎',
        label: 'Idiomas & Estudo',
        deteccao: /idioma|language|ingl[eê]s|english|espanhol|japon[eê]s|train\s+lang/i,
        tipo: 'livro',
        consultas: [
            'english grammar', 'ingles para iniciantes', 'espanhol basico',
            'japanese for beginners', 'vocabulario ingles', 'conversation english'
        ]
    },
    {
        chave: 'rpg',
        emoji: '⚔️',
        label: 'RPG & Fantasia',
        deteccao: /\brpg\b|fantasia|aventura|dungeon|projeto\s+rpg/i,
        tipo: 'livro',
        consultas: [
            'senhor dos aneis', 'game design', 'mitologia nordica',
            'dungeons and dragons', 'ficcao fantasia', 'mitologia grega'
        ]
    },
    {
        chave: 'midia',
        emoji: '🎵',
        label: 'Música & Mídia',
        deteccao: /m[uú]sica|music|playlist|m[ií]dia|media|som\b/i,
        tipo: 'musica',
        consultas: [
            'top hits brasil', 'mpb classicos', 'rock nacional',
            'lofi para estudar', 'pagode antigo', 'sertanejo atual'
        ]
    },
    {
        chave: 'vagas',
        emoji: '💼',
        label: 'Radar de Vagas Tech // Skycode',
        deteccao: /vagas?|oportunidades?|trampo|jobs?|carreiras?/i,
        tipo: 'vagas',
        consultas: ['backend', 'frontend', 'remoto', 'react', 'node', 'fullstack']
    },
    {
        chave: 'vendas',
        emoji: '🛡️',
        label: 'Balcão Seguro & Anti-Golpe // Skycode',
        deteccao: /vendas?|compras?|loja|mercado|trade|neg[oó]cios?/i,
        tipo: 'vendas',
        consultas: ['reputacao', 'anti-golpe', 'dicas-seguranca', 'pix-seguro']
    },
    {
        chave: 'futebol',
        emoji: '⚽',
        label: 'Resenha Esportiva do GOAT // Skycode',
        deteccao: /futebol|goat|resenha|campeonato|bola|esporte/i,
        tipo: 'futebol',
        consultas: ['brasileirao', 'champions', 'premier', 'laliga']
    },
    {
        chave: 'dev',
        emoji: '👨‍💻',
        label: 'Programação & Código',
        // "skycode" primeiro: é o nome da casa e deve vencer palavras genéricas.
        deteccao: /skycode|\bdev\b|c[oó]digo|\bcode\b|program|software|studios?|comandos?|\badm/i,
        tipo: 'livro',
        consultas: [
            'clean code programming', 'javascript', 'python programming',
            'algoritmos e estrutura de dados', 'arquitetura de software',
            'design patterns', 'banco de dados sql', 'linux terminal',
            'git controle de versao', 'seguranca da informacao'
        ]
    },
    {
        chave: 'geral',
        emoji: '📚',
        label: 'Conhecimento Geral',
        deteccao: null,   // fallback: nunca casa por regex, só é escolhido na falta
        tipo: 'livro',
        consultas: [
            'produtividade', 'financas pessoais', 'psicologia',
            'historia do brasil', 'filosofia', 'ciencia divulgacao'
        ]
    }
]

const TEMA_BY_KEY = {}
for (const t of TEMAS) TEMA_BY_KEY[t.chave] = t

/** Intervalo padrão entre entregas. */
const INTERVALO_PADRAO_MIN = 150   // 2h30

/** Piso de segurança: evita configurar o bot para floodar o grupo. */
const INTERVALO_MINIMO_MIN = 30

/**
 * Deduz o tema pelo nome do grupo.
 * @param {string} nomeGrupo
 * @returns {object} tema (nunca null — cai em "geral")
 */
function detectarTema(nomeGrupo) {
    const nome = String(nomeGrupo || '')
    for (const t of TEMAS) {
        if (t.deteccao && t.deteccao.test(nome)) return t
    }
    return TEMA_BY_KEY.geral
}

/**
 * Resolve a chave de um tema digitado pelo dono.
 * @param {string} entrada
 */
function resolverTema(entrada) {
    const k = String(entrada || '').toLowerCase().trim().replace(/[^a-z]/g, '')
    if (TEMA_BY_KEY[k]) return k
    const apelidos = { codigo: 'dev', code: 'dev', programacao: 'dev', livros: 'geral', musica: 'midia', music: 'midia', idioma: 'idiomas', estudo: 'idiomas' }
    return apelidos[k] || null
}

module.exports = { TEMAS, TEMA_BY_KEY, INTERVALO_PADRAO_MIN, INTERVALO_MINIMO_MIN, detectarTema, resolverTema }
