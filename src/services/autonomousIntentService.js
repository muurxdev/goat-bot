/**
 * Autonomous Intent Service
 * Motor de Inteligência e Autonomia Conversacional (24H Engine)
 * ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ // ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Prime (➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤)
 *
 * Responsável por:
 * 1. Resolver comandos enviados SEM prefixo (ex: "menu", "perfil", "dono", "cassino")
 * 2. Mapear instruções em linguagem natural para comandos oficiais (ex: "mostra o menu", "quem é o dono", "revela a foto")
 * 3. Habilitar o modo ChatGPT / Conversa Natural sem bloquear a execução de ferramentas e comandos específicos
 */

const { findCommand } = require('../handlers/commandDispatcher');

/**
 * Comandos clássicos universais que sempre devem responder mesmo em grupos sem modo chat
 */
const UNIVERSAL_NO_PREFIX_COMMANDS = new Set([
    'menu', 'ajuda', 'help', 'comandos', 'regras', 'dono', 'bot',
    'perfil', 'slayer', 'carteira', 'saldo', 'revelar', 'cassino',
    'jogos', 'ping', 'roaming', 'status', 'login', 'fig', 'toimg',
    'transcrever', 'moedas', 'ranking', 'dado', 'moeda', 'manual', 'guia'
]);

/**
 * Mapeamento de intenções em linguagem natural para comandos e argumentos
 */
const NATURAL_INTENTS = [
    // Manual / Guia do Bot
    {
        patterns: [
            /^(manual|guia|tutorial|instru[cç][oõ]es|como\s+funciona(\s+o\s+bot)?)$/i,
            /^(mostra|mostrar|ver|abre|abrir)\s+(o\s+)?(manual|guia|tutorial)/i
        ],
        command: 'manual',
        args: []
    },
    // Menu / Ajuda / Táticas
    {
        patterns: [
            /^(menu|ajuda|help|comandos|t[aá]ticas)$/i,
            /^(mostra|mostrar|abre|abrir|ver|manda|mandar|exibe|exibir|qual[eé]|passa|passar)\s+(o\s+)?(menu|painel|comandos|t[aá]ticas|op[cç][oõ]es)/i,
            /^(quais|me\s+mostra|me\s+manda|me\s+passa)\s+(os\s+)?(comandos|fun[cç][oõ]es)/i,
            /^(o\s+que\s+(voc[eê]|vc)\s+faz|ajuda|help|comandos)$/i
        ],
        command: 'menu',
        args: []
    },
    // Perfil / Nível / Ficha / Status
    {
        patterns: [
            /^(mostra|mostrar|ver|meu|qual[eé]|exibe|exibir)\s+(o\s+)?(meu\s+)?(perfil|dossi[eê]|status|level|n[ií]vel|xp|patente)/i,
            /^(meu\s+perfil|minha\s+ficha|quem\s+sou\s+eu)$/i
        ],
        command: 'perfil',
        args: []
    },
    // Carteira / Saldo / Moedas
    {
        patterns: [
            /^(mostra|mostrar|ver|qual[eé]|quanto\s+eu\s+tenho|meu)\s+(o\s+)?(meu\s+)?(saldo|carteira|coins|moedas|dinheiro|banco|grana|patrim[oô]nio)/i,
            /^(meu\s+saldo|minha\s+carteira|minhas\s+moedas)$/i
        ],
        command: 'carteira',
        args: []
    },
    // Dono / Criador do Bot
    {
        patterns: [
            /^(quem\s+[eé]|qual\s+[eé]|falar\s+com|contato\s+do|chamar\s+o)\s+(o\s+)?(dono|criador|desenvolvedor|dev|fundador|adm\s+geral|mestre)/i,
            /^(dono|criador|dev)$/i
        ],
        command: 'dono',
        args: []
    },
    // Revelar Visualização Única
    {
        patterns: [
            /^(revela|revelar|desoculta|desocultar|abre|abrir)\s+(a\s+|o\s+|essa\s+|esse\s+|esta\s+|este\s+)?(foto|imagem|v[ií]deo|video|[aá]udio|audio|visu|visualiza[cç][aã]o|vo|m[ií]dia)/i,
            /^(revela|revelar|desoculta|desocultar|abrirvo|visu|visuunica)$/i
        ],
        command: 'revelar',
        args: []
    },
    // Transcrever Áudio
    {
        patterns: [
            /^(transcreve|transcrever|ouve|ouvir|escreve|escrever|o\s+que\s+(ele|ela|disseram|falou)\s+no)\s+([aá]udio|audio|voz|mensagem\s+de\s+voz)/i,
            /^(transcrever|transcricao|transcri[cç][aã]o|audiotexto)$/i
        ],
        command: 'transcrever',
        args: []
    },
    // Figurinhas / Stickers
    {
        patterns: [
            /^(faz|fazer|cria|criar|transforma|transformar|converte|converter)\s+(em\s+)?(figurinha|figurinha\s+em\s+sticker|sticker|fig)/i,
            /^(figurinha|sticker)$/i
        ],
        command: 'fig',
        args: []
    },
    // Regras do Grupo
    {
        patterns: [
            /^(mostra|mostrar|ver|quais\s+s[aã]o|quais\s+as|quais)\s+(as\s+)?(regras|normas|diretrizes)(\s+do\s+grupo)?/i,
            /^(regras|normas)$/i
        ],
        command: 'regras',
        args: []
    },
    // Status do Bot / Machine Learning
    {
        patterns: [
            /^(status|como\s+est[aá]|sa[uú]de)\s+(do\s+bot|da\s+m[aá]quina|do\s+sistema|da\s+ia|do\s+machine)/i
        ],
        command: 'machine',
        args: ['status']
    },
    // Varredura de Palavrões / Roaming
    {
        patterns: [
            /^(fazer\s+varredura|varredura|roaming|scan|varredura\s+de\s+palavr[oõ]es)/i
        ],
        command: 'profanity',
        args: ['roaming']
    },
    // Jogar Dado
    {
        patterns: [
            /^(rola|rolar|joga|jogar|girar|tirar)\s+(um\s+)?(dado|dados)/i,
            /^(dado)$/i
        ],
        command: 'dado',
        args: []
    },
    // Moeda / Cara ou Coroa
    {
        patterns: [
            /^(cara\s+ou\s+coroa|joga\s+a\s+moeda|jogar\s+moeda|girar\s+moeda)/i,
            /^(moeda)$/i
        ],
        command: 'moeda',
        args: []
    },
    // Ping / Velocidade
    {
        patterns: [
            /^(qual(\s+[eé])?\s+o\s+|como\s+est[aá]\s+o\s+)?(ping|velocidade|lat[eê]ncia|ms)(\s+do\s+bot)?$/i,
            /^(ping|lat[eê]ncia|velocidade)$/i
        ],
        command: 'ping',
        args: []
    },
    // Cassino / Jogos
    {
        patterns: [
            /^(abrir|jogar|ver|entrar\s+no)\s+(cassino|roleta|jogos)/i,
            /^(cassino|jogos)$/i
        ],
        command: 'cassino',
        args: []
    }
];

/**
 * Avalia o texto de uma mensagem e resolve se deve disparar comando ou conversa ChatGPT
 * @param {string} body - Texto da mensagem
 * @param {object} context - Contexto da mensagem ({ from, sender, isGroup, isBotMentioned, respondeuBot, configs })
 * @returns {{ isCommand?: boolean, commandName?: string, args?: string[], directText?: string, isChat?: boolean, cleanPrompt?: string, isIgnored?: boolean }}
 */
function resolveAutonomousAction(body = '', { from, sender, isGroup, isBotMentioned = false, respondeuBot = false, configs = {} } = {}) {
    if (!body || typeof body !== 'string') return { isIgnored: true };

    const cleanBody = body.replace(/@\d+/g, '').trim();
    if (!cleanBody) return { isIgnored: true };

    const isChatMode = !isGroup || Boolean(configs[from]?.conversaNatural || configs['global']?.conversaNatural);

    // 1. Checagem de Comandos Parametrizados Especiais (Machine Train, Tradução, IA)
    const trainMatch = cleanBody.match(/^(?:treinar|treina|aprende|aprender)(?:\s+(?:a\s+palavra|o\s+termo|a\s+express[aã]o|palavra|termo|express[aã]o))?\s+(.+)$/i);
    if (trainMatch) {
        const termo = trainMatch[1].trim();
        if (termo) {
            return {
                isCommand: true,
                commandName: 'machine',
                args: ['train', ...termo.split(/ +/)],
                directText: `train ${termo}`
            };
        }
    }

    const traduzirMatch = cleanBody.match(/^(traduz|traduzir|traduza)\s+(.+)$/i);
    if (traduzirMatch) {
        const resto = traduzirMatch[2].trim();
        return {
            isCommand: true,
            commandName: 'traduzir',
            args: resto.split(/ +/),
            directText: resto
        };
    }

    // 2. Mapeamento de Intenções em Linguagem Natural
    for (const intent of NATURAL_INTENTS) {
        if (intent.patterns.some(p => p.test(cleanBody))) {
            return {
                isCommand: true,
                commandName: intent.command,
                args: [...intent.args],
                directText: intent.args.join(' ')
            };
        }
    }

    // 3. Comandos Diretos Sem Prefixo (primeira palavra bate com comando registrado)
    const words = cleanBody.split(/ +/);
    const firstWord = words[0]?.toLowerCase().replace(/^[.!#\/]/, '');
    const foundCmd = findCommand(firstWord);

    if (foundCmd) {
        const cmdName = foundCmd.name;
        const isUniversal = UNIVERSAL_NO_PREFIX_COMMANDS.has(cmdName);

        // Dispara comando sem prefixo se:
        // - Está em PV (sempre)
        // - O modo conversa/ChatGPT está ligado no grupo (sempre)
        // - O bot foi mencionado ou respondido (sempre)
        // - É um dos comandos universais amigáveis (menu, regras, dono, cassino, etc.)
        if (!isGroup || isChatMode || isBotMentioned || respondeuBot || isUniversal) {
            return {
                isCommand: true,
                commandName: cmdName,
                args: words.slice(1),
                directText: words.slice(1).join(' ')
            };
        }
    }

    // 4. Modo Conversacional ChatGPT / ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Prime 24h
    // Se não é comando, mas o modo chat está ativo OU o bot foi chamado:
    if (isChatMode || isBotMentioned || respondeuBot) {
        return {
            isChat: true,
            cleanPrompt: cleanBody
        };
    }

    return { isIgnored: true };
}

module.exports = {
    resolveAutonomousAction,
    UNIVERSAL_NO_PREFIX_COMMANDS,
    NATURAL_INTENTS
};
