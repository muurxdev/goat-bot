/**
 * Serviço Inteligente de Recomendação e Versatilidade de Comandos
 * 
 * Recomenda os melhores comandos no momento certo:
 * 1. Próximos passos complementares após a execução de comandos
 * 2. Descoberta por intenção em linguagem natural (ex: "como ganhar dinheiro", "proteger grupo")
 * 3. Sugestão inteligente para comandos desconhecidos ou com erros de digitação
 */

const RELATED_ACTIONS = {
    // 💰 Economia & Banco
    saldo: [
        { cmd: 'diario', desc: 'Resgate suas moedas diárias grátis', emoji: '🎁' },
        { cmd: 'trabalhar', desc: 'Trabalhe para ganhar uma renda extra', emoji: '💼' },
        { cmd: 'investir', desc: 'Faça render seu dinheiro no banco', emoji: '📈' },
        { cmd: 'pix', desc: 'Transfira moedas para outro membro', emoji: '💸' }
    ],
    diario: [
        { cmd: 'saldo', desc: 'Veja seu novo saldo atualizado', emoji: '💰' },
        { cmd: 'investir', desc: 'Guarde no banco com rendimento', emoji: '🏦' },
        { cmd: 'trabalhar', desc: 'Complete um turno de trabalho', emoji: '💼' }
    ],
    trabalhar: [
        { cmd: 'saldo', desc: 'Confira suas economias', emoji: '💰' },
        { cmd: 'investir', desc: 'Invista no mercado financeiro', emoji: '📊' },
        { cmd: 'cassino', desc: 'Tente a sorte nos jogos de aposta', emoji: '🎰' }
    ],
    investir: [
        { cmd: 'saldo', desc: 'Consulte seu extrato', emoji: '💰' },
        { cmd: 'banco', desc: 'Gerencie sua conta bancária', emoji: '🏦' },
        { cmd: 'empresas', desc: 'Abra ou compre ações de empresas', emoji: '🏢' }
    ],

    // ⚔️ RPG & Combate
    batalhar: [
        { cmd: 'curar', desc: 'Restaure sua vida e estamina', emoji: '🧪' },
        { cmd: 'inventario', desc: 'Equipe armas e veja itens obtidos', emoji: '🎒' },
        { cmd: 'statusrpg', desc: 'Confira seus atributos e poder', emoji: '📊' },
        { cmd: 'dungeon', desc: 'Enfrente masmorras de nível superior', emoji: '🏰' }
    ],
    cacar: [
        { cmd: 'inventario', desc: 'Veja as recompensas da caçada', emoji: '🎒' },
        { cmd: 'forjar', desc: 'Crie equipamentos com os materiais', emoji: '🔨' },
        { cmd: 'curar', desc: 'Recupere seus pontos de vida', emoji: '🧪' }
    ],
    dungeon: [
        { cmd: 'curar', desc: 'Use poções de recuperação rápida', emoji: '🧪' },
        { cmd: 'cla', desc: 'Chame companheiros do seu clã', emoji: '🛡️' },
        { cmd: 'boss', desc: 'Desafie o chefe da temporada', emoji: '👹' }
    ],
    curar: [
        { cmd: 'batalhar', desc: 'Volte para a arena 100% recuperado', emoji: '⚔️' },
        { cmd: 'statusrpg', desc: 'Confira sua vida e mana atuais', emoji: '✨' }
    ],

    // 📥 Mídia, Downloads & Áudio
    play: [
        { cmd: 'letra', desc: 'Acompanhe a letra sincronizada', emoji: '📜' },
        { cmd: 'ytmp4', desc: 'Baixe o videoclipe em vídeo HD', emoji: '🎬' },
        { cmd: 'topmusicas', desc: 'Ouça os maiores sucessos do momento', emoji: '🔥' }
    ],
    ytmp3: [
        { cmd: 'letra', desc: 'Leia a letra da música', emoji: '📜' },
        { cmd: 'ytmp4', desc: 'Baixe o vídeo completo', emoji: '🎥' }
    ],
    media: [
        { cmd: 'play', desc: 'Baixe apenas o áudio em MP3', emoji: '🎵' },
        { cmd: 'fig', desc: 'Transforme um frame em figurinha', emoji: '🎨' }
    ],
    fig: [
        { cmd: 'toimg', desc: 'Converta a figurinha de volta em foto', emoji: '🖼️' },
        { cmd: 'emojimix', desc: 'Misture dois emojis em um sticker', emoji: '🎭' }
    ],

    // ⚽ Esportes & Futebol (Clube dos Campeões / GOAT)
    esportefutebol: [
        { cmd: 'brasileirao', desc: 'Tabela completa do Brasileirão Série A', emoji: '🇧🇷' },
        { cmd: 'champions', desc: 'UEFA Champions League fase de liga', emoji: '🏆' },
        { cmd: 'libertadores', desc: 'Copa Libertadores da América', emoji: '🌎' },
        { cmd: 'jogos', desc: 'Placar ao vivo e jogos de hoje', emoji: '🏟️' }
    ],
    brasileirao: [
        { cmd: 'jogos brasileirao', desc: 'Jogos de hoje e placar ao vivo', emoji: '🏟️' },
        { cmd: 'serieb', desc: 'Classificação do Brasileirão Série B', emoji: '🇧🇷' },
        { cmd: 'champions', desc: 'UEFA Champions League', emoji: '🏆' },
        { cmd: 'libertadores', desc: 'Copa Libertadores', emoji: '🌎' }
    ],
    serieb: [
        { cmd: 'jogos serieb', desc: 'Partidas da Série B', emoji: '🏟️' },
        { cmd: 'brasileirao', desc: 'Tabela do Brasileirão Série A', emoji: '🇧🇷' },
        { cmd: 'orientacao futebol', desc: 'Manual do módulo esportivo', emoji: '🧭' }
    ],
    champions: [
        { cmd: 'jogos champions', desc: 'Partidas da Champions League', emoji: '🏟️' },
        { cmd: 'libertadores', desc: 'Copa Libertadores da América', emoji: '🌎' },
        { cmd: 'premier', desc: 'Premier League Inglesa', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
        { cmd: 'brasileirao', desc: 'Brasileirão Série A', emoji: '🇧🇷' }
    ],
    libertadores: [
        { cmd: 'jogos libertadores', desc: 'Partidas da Copa Libertadores', emoji: '🏟️' },
        { cmd: 'champions', desc: 'UEFA Champions League', emoji: '🏆' },
        { cmd: 'brasileirao', desc: 'Brasileirão Série A', emoji: '🇧🇷' },
        { cmd: 'orientacao futebol', desc: 'Manual do módulo esportivo', emoji: '🧭' }
    ],
    premier: [
        { cmd: 'jogos premier', desc: 'Partidas da Premier League', emoji: '🏟️' },
        { cmd: 'champions', desc: 'UEFA Champions League', emoji: '🏆' },
        { cmd: 'laliga', desc: 'La Liga Espanhola', emoji: '🇪🇸' },
        { cmd: 'brasileirao', desc: 'Brasileirão Série A', emoji: '🇧🇷' }
    ],
    laliga: [
        { cmd: 'jogos laliga', desc: 'Partidas de La Liga', emoji: '🏟️' },
        { cmd: 'champions', desc: 'UEFA Champions League', emoji: '🏆' },
        { cmd: 'premier', desc: 'Premier League Inglesa', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
        { cmd: 'brasileirao', desc: 'Brasileirão Série A', emoji: '🇧🇷' }
    ],
    jogos: [
        { cmd: 'brasileirao', desc: 'Tabela do Brasileirão', emoji: '🇧🇷' },
        { cmd: 'champions', desc: 'Tabela da Champions League', emoji: '🏆' },
        { cmd: 'libertadores', desc: 'Grupos da Libertadores', emoji: '🌎' },
        { cmd: 'campeonato', desc: 'Central de campeonatos', emoji: '⚽' }
    ],
    tabela: [
        { cmd: 'jogos', desc: 'Partidas de hoje e placar ao vivo', emoji: '🏟️' },
        { cmd: 'brasileirao', desc: 'Brasileirão Série A', emoji: '🇧🇷' },
        { cmd: 'champions', desc: 'UEFA Champions League', emoji: '🏆' },
        { cmd: 'libertadores', desc: 'Copa Libertadores', emoji: '🌎' }
    ],
    campeonato: [
        { cmd: 'brasileirao', desc: 'Brasileirão Série A', emoji: '🇧🇷' },
        { cmd: 'champions', desc: 'UEFA Champions League', emoji: '🏆' },
        { cmd: 'libertadores', desc: 'Copa Libertadores', emoji: '🌎' },
        { cmd: 'jogos', desc: 'Jogos do dia', emoji: '🏟️' }
    ],

    // 💼 Vagas & Carreira Tech
    vagas: [
        { cmd: 'vagas remoto', desc: 'Filtre apenas vagas 100% Home Office', emoji: '🏠' },
        { cmd: 'vagas backend', desc: 'Oportunidades em Node, Python, Java, Go', emoji: '💻' },
        { cmd: 'noticias', desc: 'Notícias do mercado e tecnologia no TabNews', emoji: '📰' }
    ],

    // 🛡️ Comércio & Reputação
    reputacao: [
        { cmd: 'reputacao positivo', desc: 'Avalie uma negociação bem-sucedida', emoji: '⭐' },
        { cmd: 'reputacao alertar', desc: 'Emita alerta comunitário contra golpes', emoji: '🚨' },
        { cmd: 'saldo', desc: 'Confira suas moedas e finanças', emoji: '💰' }
    ],

    // 📚 Livros, Conhecimento & IA
    livro: [
        { cmd: 'resumo', desc: 'Peça uma síntese dos capítulos', emoji: '📝' },
        { cmd: 'ia', desc: 'Faça perguntas sobre a história ou autor', emoji: '🧠' },
        { cmd: 'noticias', desc: 'Veja novidades e lançamentos', emoji: '📰' }
    ],
    noticias: [
        { cmd: 'ia', desc: 'Aprofunde ou tire dúvidas sobre a notícia', emoji: '🧠' },
        { cmd: 'encurtar', desc: 'Encurte o link para compartilhar no grupo', emoji: '🔗' },
        { cmd: 'clima', desc: 'Veja a previsão do tempo para hoje', emoji: '⛅' }
    ],
    ia: [
        { cmd: 'explicar', desc: 'Receba uma explicação passo a passo', emoji: '💡' },
        { cmd: 'traduzir', desc: 'Traduza o texto para outros idiomas', emoji: '🌐' },
        { cmd: 'resumo', desc: 'Gere um resumo enxuto e direto', emoji: '📄' }
    ],
    encurtar: [
        { cmd: 'encurtar expandir', desc: 'Revele para onde um link encurtado leva', emoji: '🔍' },
        { cmd: 'qrcode', desc: 'Gere um código QR compartilhável', emoji: '📱' }
    ],

    // 🛡️ Moderação & Grupos
    preset: [
        { cmd: 'agenda', desc: 'Programe os horários de abrir/fechar', emoji: '📅' },
        { cmd: 'moderacao', desc: 'Consulte o status de todos os escudos', emoji: '🛡️' },
        { cmd: 'orientacao preset', desc: 'Guia completo de presets', emoji: '🧭' }
    ],
    agenda: [
        { cmd: 'preset', desc: 'Configure as permissões temáticas do grupo', emoji: '⚙️' },
        { cmd: 'fechar', desc: 'Tranque o grupo imediatamente', emoji: '🔒' },
        { cmd: 'abrir', desc: 'Reabra o grupo para mensagens', emoji: '🔓' },
        { cmd: 'orientacao agenda', desc: 'Manual da agenda automática', emoji: '🧭' }
    ],
    agendagrupo: [
        { cmd: 'abrir', desc: 'Reabrir o grupo agora', emoji: '🔓' },
        { cmd: 'fechar', desc: 'Trancar o grupo agora', emoji: '🔒' },
        { cmd: 'preset', desc: 'Aplicar perfil de regras', emoji: '⚙️' },
        { cmd: 'orientacao agenda', desc: 'Manual da agenda', emoji: '🧭' }
    ],
    abrir: [
        { cmd: 'fechar', desc: 'Trancar o grupo quando necessário', emoji: '🔒' },
        { cmd: 'agenda', desc: 'Programar horários automáticos', emoji: '📅' },
        { cmd: 'preset', desc: 'Configurar permissões do grupo', emoji: '⚙️' },
        { cmd: 'orientacao abertura', desc: 'Manual completo de abertura', emoji: '🧭' }
    ],
    abrirgrupo: [
        { cmd: 'fechar', desc: 'Trancar o grupo', emoji: '🔒' },
        { cmd: 'agenda', desc: 'Programar horários automáticos', emoji: '📅' },
        { cmd: 'orientacao abertura', desc: 'Manual de abertura', emoji: '🧭' }
    ],
    fechar: [
        { cmd: 'abrir', desc: 'Reabrir o grupo', emoji: '🔓' },
        { cmd: 'agenda', desc: 'Programar horários automáticos', emoji: '📅' },
        { cmd: 'preset', desc: 'Configurar permissões do grupo', emoji: '⚙️' },
        { cmd: 'orientacao abertura', desc: 'Manual de abertura e fechamento', emoji: '🧭' }
    ],
    fechargrupo: [
        { cmd: 'abrir', desc: 'Reabrir o grupo', emoji: '🔓' },
        { cmd: 'agenda', desc: 'Programar horários automáticos', emoji: '📅' },
        { cmd: 'orientacao abertura', desc: 'Manual de abertura e fechamento', emoji: '🧭' }
    ],
    orientacao: [
        { cmd: 'orientacao abertura', desc: 'Guia de abrir e fechar grupo', emoji: '🔓' },
        { cmd: 'orientacao agenda', desc: 'Guia da agenda automática', emoji: '📅' },
        { cmd: 'orientacao preset', desc: 'Guia de blindagem e presets', emoji: '🛡️' },
        { cmd: 'orientacao futebol', desc: 'Guia de tabelas e campeonatos', emoji: '⚽' }
    ],
    menu: [
        { cmd: 'orientacao', desc: 'Central de orientação e tutoriais', emoji: '🧭' },
        { cmd: 'regras', desc: 'Regras da comunidade', emoji: '📜' },
        { cmd: 'saldo', desc: 'Economia e moedas', emoji: '💰' },
        { cmd: 'ajuda', desc: 'Central de suporte', emoji: '❓' }
    ],
    moderacao: [
        { cmd: 'preset', desc: 'Aplique um perfil pronto de segurança', emoji: '⚡' },
        { cmd: 'antilink', desc: 'Controle filtros específicos de links', emoji: '🔗' },
        { cmd: 'antitrava', desc: 'Blindagem ativa contra travas de zap', emoji: '🛡️' }
    ]
};

const INTENT_DICTIONARY = [
    {
        topic: 'Ganhar Moedas & Economia',
        keywords: ['dinheiro', 'moeda', 'moedas', 'grana', 'rico', 'ganhar', 'trabalho', 'renda', 'investimento', 'pix', 'banco'],
        commands: [
            { cmd: 'diario', desc: 'Recompensa diária grátis de moedas' },
            { cmd: 'trabalhar', desc: 'Trabalhe e receba seu pagamento' },
            { cmd: 'investir', desc: 'Renda passiva com juros compostos' },
            { cmd: 'saldo', desc: 'Consulte seu saldo e patrimônio' }
        ]
    },
    {
        topic: 'Música & Vídeos',
        keywords: ['musica', 'música', 'som', 'ouvir', 'tocar', 'video', 'vídeo', 'download', 'baixar', 'youtube', 'spotify', 'tiktok'],
        commands: [
            { cmd: 'play', desc: 'Toca e baixa qualquer música em MP3' },
            { cmd: 'ytmp4', desc: 'Baixa vídeos do YouTube em alta definição' },
            { cmd: 'media', desc: 'Baixa vídeos do TikTok, Instagram e Twitter' },
            { cmd: 'letra', desc: 'Mostra a letra completa da música' }
        ]
    },
    {
        topic: 'Aventura & RPG',
        keywords: ['jogar', 'rpg', 'batalha', 'monstro', 'espada', 'luta', 'dungeon', 'boss', 'masmorra', 'nivel', 'combate'],
        commands: [
            { cmd: 'batalhar', desc: 'Lute contra monstros da sua patente' },
            { cmd: 'coliseu', desc: 'Enfrente ondas de gladiadores' },
            { cmd: 'dungeon', desc: 'Explore masmorras perigosas com loot épico' },
            { cmd: 'statusrpg', desc: 'Veja sua ficha de herói e atributos' }
        ]
    },
    {
        topic: 'Estudos, Livros & Pesquisa',
        keywords: ['livro', 'ler', 'pdf', 'estudo', 'escola', 'prova', 'enem', 'duvida', 'pesquisa', 'explicar', 'aprender'],
        commands: [
            { cmd: 'livro', desc: 'Busca e envia PDFs de livros completos da web' },
            { cmd: 'ia', desc: 'Tira qualquer dúvida com respostas completas' },
            { cmd: 'noticias', desc: 'Artigos e notícias de tecnologia e geral' },
            { cmd: 'calc_bhaskara', desc: 'Resolve equações matemáticas passo a passo' }
        ]
    },
    {
        topic: 'Segurança & Moderação de Grupos',
        keywords: ['proteger', 'trava', 'link', 'spam', 'seguranca', 'segurança', 'moderar', 'fechar', 'trancar', 'agenda', 'horario', 'preset'],
        commands: [
            { cmd: 'preset', desc: 'Aplica perfil pronto de moderação em 1 comando' },
            { cmd: 'agenda', desc: 'Programa horários de abrir e fechar o grupo' },
            { cmd: 'moderacao all on', desc: 'Ativa todos os escudos de segurança' },
            { cmd: 'antilink on', desc: 'Bloqueia links indesejados automaticamente' }
        ]
    },
    {
        topic: 'Figurinhas & Stickers',
        keywords: ['figurinha', 'figurinhas', 'sticker', 'stickers', 'meme', 'foto', 'imagem', 'converter'],
        commands: [
            { cmd: 'fig', desc: 'Cria figurinha a partir de imagem ou vídeo' },
            { cmd: 'toimg', desc: 'Converte sticker de volta em foto' },
            { cmd: 'emojimix', desc: 'Funde dois emojis em um adesivo exclusivo' },
            { cmd: 'meme', desc: 'Adiciona legenda cômica na sua foto' }
        ]
    },
    {
        topic: 'Futebol, Jogos & Tabela (GOAT)',
        keywords: ['futebol', 'fut', 'tabela', 'jogos', 'placar', 'brasileirao', 'brasileirão', 'champions', 'goat', 'campeonato', 'serie a', 'serie b'],
        commands: [
            { cmd: 'esportefutebol tabela', desc: 'Tabela em tempo real do Brasileirão, Champions e ligas' },
            { cmd: 'esportefutebol jogos', desc: 'Placar ao vivo e partidas da rodada' },
            { cmd: 'quizfutebol', desc: 'Quiz temático de futebol' },
            { cmd: 'esportefutebol regras', desc: 'Regras e curiosidades históricas do esporte' }
        ]
    },
    {
        topic: 'Vagas & Emprego Tech',
        keywords: ['vaga', 'vagas', 'emprego', 'trampo', 'contratando', 'recrutador', 'remoto', 'home office', 'clt', 'pj'],
        commands: [
            { cmd: 'vagas', desc: 'Radar de vagas tech atualizado em tempo real' },
            { cmd: 'vagas remoto', desc: 'Apenas vagas 100% trabalho remoto' },
            { cmd: 'vagas backend', desc: 'Vagas para desenvolvedores Backend' },
            { cmd: 'vagas frontend', desc: 'Vagas para Frontend e React' }
        ]
    },
    {
        topic: 'Reputação Comercial & Anti-Golpe',
        keywords: ['golpe', 'fraude', 'venda', 'vendas', 'compra', 'comprar', 'reputacao', 'reputação', 'confiavel', 'confiável', 'avaliar'],
        commands: [
            { cmd: 'reputacao', desc: 'Consulta o score e badge de confiança do membro' },
            { cmd: 'reputacao positivo', desc: 'Registra feedback positivo com motivo' },
            { cmd: 'reputacao alertar', desc: 'Reporta tentativa de golpe para a comunidade' }
        ]
    }
];

/**
 * Retorna os próximos passos recomendados para um comando recém-executado.
 * @param {string} commandName
 * @param {number} limit
 * @returns {Array<{cmd: string, desc: string, emoji: string}>}
 */
function getRelatedActions(commandName, limit = 3) {
    if (!commandName) return [];
    const clean = String(commandName).toLowerCase().trim().replace(/^[.!#\/]/, '');
    const found = RELATED_ACTIONS[clean];
    if (found && found.length > 0) {
        return found.slice(0, limit);
    }
    return [];
}

/**
 * Descobre recomendações de comandos baseadas em intenção ou dúvida do usuário.
 * @param {string} query
 * @param {number} limit
 * @returns {{topic: string, commands: Array<{cmd: string, desc: string}>}}
 */
function suggestByIntent(query, limit = 4) {
    const q = String(query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (!q) {
        return {
            topic: 'Destaques mais Populares',
            commands: [
                { cmd: 'menu', desc: 'Acesse todas as categorias de comandos' },
                { cmd: 'ia', desc: 'Faça qualquer pergunta para o assistente' },
                { cmd: 'play', desc: 'Baixe qualquer música diretamente' },
                { cmd: 'batalhar', desc: 'Entre na arena de combate RPG' }
            ]
        };
    }

    let bestMatch = null;
    let maxScore = 0;

    for (const item of INTENT_DICTIONARY) {
        let score = 0;
        for (const kw of item.keywords) {
            const cleanKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (q.includes(cleanKw)) score += 3;
            else if (cleanKw.includes(q)) score += 1;
        }
        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    }

    if (bestMatch && maxScore > 0) {
        return {
            topic: bestMatch.topic,
            commands: bestMatch.commands.slice(0, limit)
        };
    }

    return {
        topic: 'Principais Ferramentas',
        commands: [
            { cmd: 'menu', desc: 'Painel com todos os comandos' },
            { cmd: 'ia', desc: 'Inteligência artificial para perguntas' },
            { cmd: 'livro', desc: 'Biblioteca aberta de PDFs' },
            { cmd: 'saldo', desc: 'Sistema econômico e moedas' }
        ]
    };
}

const CATEGORY_FALLBACKS = {
    admin: [
        { cmd: 'preset', desc: 'Aplica perfil pronto de regras' },
        { cmd: 'agenda', desc: 'Programa horários de abrir/fechar' },
        { cmd: 'abrir', desc: 'Abre o grupo' },
        { cmd: 'orientacao abertura', desc: 'Manual de abertura e fechamento' }
    ],
    economy: [
        { cmd: 'saldo', desc: 'Consulta moedas e saldo' },
        { cmd: 'diario', desc: 'Recompensa diária grátis' },
        { cmd: 'trabalhar', desc: 'Trabalho remunerado' },
        { cmd: 'investir', desc: 'Rendimentos no banco' }
    ],
    rpg: [
        { cmd: 'batalhar', desc: 'Arena de combate' },
        { cmd: 'curar', desc: 'Restaura vida e estamina' },
        { cmd: 'statusrpg', desc: 'Ficha e atributos' },
        { cmd: 'dungeon', desc: 'Masmorras e recompensas' }
    ],
    media: [
        { cmd: 'play', desc: 'Baixa música MP3' },
        { cmd: 'ytmp4', desc: 'Baixa vídeo HD' },
        { cmd: 'letra', desc: 'Letra sincronizada' },
        { cmd: 'fig', desc: 'Cria figurinhas' }
    ],
    fun: [
        { cmd: 'fig', desc: 'Cria figurinha' },
        { cmd: 'toimg', desc: 'Converte sticker em foto' },
        { cmd: 'emojimix', desc: 'Funde emojis' },
        { cmd: 'meme', desc: 'Gera memes' }
    ],
    general: [
        { cmd: 'menu', desc: 'Painel com todos os comandos' },
        { cmd: 'orientacao', desc: 'Central de orientação e manuais' },
        { cmd: 'brasileirao', desc: 'Tabela do Brasileirão' },
        { cmd: 'champions', desc: 'Tabela da Champions League' }
    ],
    ia: [
        { cmd: 'ia', desc: 'Assistente inteligente' },
        { cmd: 'resumo', desc: 'Gera resumos diretos' },
        { cmd: 'traduzir', desc: 'Tradução multilíngue' },
        { cmd: 'livro', desc: 'Biblioteca de PDFs' }
    ],
    dev: [
        { cmd: 'livro', desc: 'Livros de programação' },
        { cmd: 'orientacao', desc: 'Central de guias' },
        { cmd: 'menu', desc: 'Lista de comandos' }
    ],
    escola: [
        { cmd: 'livro', desc: 'Pesquisa de PDFs didáticos' },
        { cmd: 'ia', desc: 'Explicações passo a passo' },
        { cmd: 'calc', desc: 'Cálculos matemáticos' }
    ],
    ferramentas: [
        { cmd: 'clima', desc: 'Previsão do tempo' },
        { cmd: 'qrcode', desc: 'Gera QR Code' },
        { cmd: 'encurtar', desc: 'Encurta URLs' }
    ],
    profile: [
        { cmd: 'perfil', desc: 'Cartão de membro' },
        { cmd: 'rank', desc: 'Classificação de XP' },
        { cmd: 'saldo', desc: 'Saldo de moedas' }
    ],
    owner: [
        { cmd: 'auto grupos', desc: 'Visão de todos os grupos' },
        { cmd: 'auto skycode on', desc: 'Autonomia em todos da rede' },
        { cmd: 'status', desc: 'Status do servidor e bot' }
    ],
    default: [
        { cmd: 'menu', desc: 'Painel geral' },
        { cmd: 'orientacao', desc: 'Central de orientação' },
        { cmd: 'ajuda', desc: 'Suporte e ajuda' }
    ]
};

/**
 * Formata os comandos de ajuda em linha elegante, sem jamais usar a palavra "dica".
 * @param {Array<{cmd: string, desc?: string, emoji?: string}>} actions
 * @param {string} prefix
 * @returns {string}
 */
function formatRelatedActions(actions, prefix = '.') {
    if (!actions || actions.length === 0) return '';
    const cleanPrefix = prefix || '.';
    const items = actions.map(a => `\`${cleanPrefix}${a.cmd}\``).join(' · ');
    return `🧭 *Comandos para Ajudar:* ${items}`;
}

/**
 * Retorna a linha universal de comandos para ajudar para qualquer comando executado.
 * @param {string} commandName
 * @param {string} category
 * @param {string} prefix
 * @returns {string}
 */
function formatHelperLine(commandName, category = 'general', prefix = '.') {
    const actions = getRelatedActions(commandName, 4);
    let list = actions;
    if (!list || list.length === 0) {
        const cat = String(category || 'general').toLowerCase();
        list = CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS.default;
    }
    if (!list || list.length === 0) return '';
    return formatRelatedActions(list, prefix);
}

module.exports = {
    getRelatedActions,
    suggestByIntent,
    formatRelatedActions,
    formatHelperLine,
    CATEGORY_FALLBACKS,
    RELATED_ACTIONS
};
