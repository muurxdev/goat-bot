/**
 * Link Detector & Platform Classifier
 * ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ // Detecção Fluente de Links e Plataformas
 * 
 * Detecta confiavelmente links de QUALQUER rede social existente e sites da web,
 * neutralizando técnicas de evasão (espaços entre pontos, protocolos omitidos, encurtadores).
 */

// Lista de redes sociais e plataformas principais
// whatsapp_dm vem antes de tudo: se a mensagem tiver qualquer link de conversa privada, ela é
// classificada como DM e fica bloqueada mesmo com o WhatsApp liberado.
const PLATFORM_PATTERNS = [
    {
        platform: 'whatsapp_dm',
        regex: /(wa\.me\/[0-9+]+|whatsapp\.com\/send\?|wa\.link\/[A-Za-z0-9_-]+|api\.whatsapp\.com\/send)/i
    },
    {
        platform: 'whatsapp',
        regex: /(chat\.whatsapp\.com\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'canal',
        regex: /(whatsapp\.com\/channel\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'telegram',
        regex: /(t\.me\/[A-Za-z0-9_+-]+|telegram\.me\/[A-Za-z0-9_+-]+|telegram\.dog\/[A-Za-z0-9_+-]+)/i
    },
    {
        platform: 'instagram',
        regex: /(instagram\.com\/[A-Za-z0-9_.]+|instagr\.am\/[A-Za-z0-9_.]+)/i
    },
    {
        platform: 'tiktok',
        regex: /(tiktok\.com\/@[A-Za-z0-9_.]+|vm\.tiktok\.com\/[A-Za-z0-9_-]+|vt\.tiktok\.com\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'kwai',
        regex: /(kwai\.com\/[A-Za-z0-9_-]+|k\.kwai\.com\/[A-Za-z0-9_-]+|kwai-app\.com\/[A-Za-z0-9_-]+|snackvideo\.com\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'discord',
        regex: /(discord\.gg\/[A-Za-z0-9_-]+|discord\.com\/invite\/[A-Za-z0-9_-]+|discordapp\.com\/invite\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'youtube',
        regex: /(youtube\.com\/(watch\?|channel\/|c\/|user\/|shorts\/|@[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'facebook',
        regex: /(facebook\.com\/[A-Za-z0-9_.]+|fb\.me\/[A-Za-z0-9_.]+|fb\.watch\/[A-Za-z0-9_-]+|fb\.com\/[A-Za-z0-9_.]+)/i
    },
    {
        platform: 'twitter',
        regex: /(twitter\.com\/[A-Za-z0-9_]+|x\.com\/[A-Za-z0-9_]+)/i
    },
    {
        platform: 'threads',
        regex: /(threads\.net\/@[A-Za-z0-9_.]+)/i
    },
    {
        platform: 'bluesky',
        regex: /(bsky\.app\/profile\/[A-Za-z0-9_.]+)/i
    },
    {
        platform: 'twitch',
        regex: /(twitch\.tv\/[A-Za-z0-9_]+|kick\.com\/[A-Za-z0-9_]+)/i
    },
    {
        platform: 'reddit',
        regex: /(reddit\.com\/r\/[A-Za-z0-9_]+|redd\.it\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'pinterest',
        regex: /(pinterest\.com\/[A-Za-z0-9_.]+|pin\.it\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'linkedin',
        regex: /(linkedin\.com\/(in|company|posts)\/[A-Za-z0-9_-]+)/i
    },
    {
        platform: 'encurtador',
        regex: /(bit\.ly\/[A-Za-z0-9_-]+|tinyurl\.com\/[A-Za-z0-9_-]+|cutt\.ly\/[A-Za-z0-9_-]+|linktr\.ee\/[A-Za-z0-9_.-]+|is\.gd\/[A-Za-z0-9_-]+|shorte\.st\/[A-Za-z0-9_-]+|abre\.ai\/[A-Za-z0-9_-]+)/i
    }
];

// Extensões de domínio (TLDs) mais comuns para capturar qualquer site da web
const GENERIC_TLD_REGEX = /(?:https?:\/\/|www\.)[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+|[a-zA-Z0-9-]+\.(com|com\.br|net|org|org\.br|gov\.br|edu\.br|io|app|gg|me|xyz|online|site|club|tech|store|shop|vip|top|pro|link|info|live|cc|to|tv|co|us|uk|ru)\b/i;

/**
 * Normaliza o texto removendo espaços fraudulentos entre pontos e barras
 * Exemplo: "chat . whatsapp . com / 123" -> "chat.whatsapp.com/123"
 */
function normalizeSneakySpacing(text = '') {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/([a-zA-Z0-9])\s*\.\s*([a-zA-Z0-9])/g, '$1.$2')
        .replace(/([a-zA-Z0-9])\s*\/\s*([a-zA-Z0-9])/g, '$1/$2')
        .replace(/(https?)\s*:\s*\/\s*\//gi, '$1://');
}

/**
 * Verifica se a mensagem contém qualquer link (redes sociais, encurtadores ou sites gerais)
 * @param {string} text
 * @returns {boolean}
 */
function containsLink(text = '') {
    if (!text || typeof text !== 'string') return false;
    const clean = normalizeSneakySpacing(text);

    // 1. Checa padrões específicos de redes sociais e plataformas
    for (const item of PLATFORM_PATTERNS) {
        if (item.regex.test(clean)) return true;
    }

    // 2. Checa URLs genéricas (http://, https://, domínios conhecidos)
    if (GENERIC_TLD_REGEX.test(clean)) return true;

    return false;
}

/**
 * Identifica a plataforma do link presente no texto
 * @param {string} text
 * @returns {string} 'whatsapp' | 'canal' | 'telegram' | 'instagram' | 'tiktok' | 'kwai' | 'discord' | 'youtube' | 'facebook' | 'twitter' | 'threads' | 'outros'
 */
function detectLinkPlatform(text = '') {
    if (!text || typeof text !== 'string') return 'outros';
    const clean = normalizeSneakySpacing(text);

    for (const item of PLATFORM_PATTERNS) {
        if (item.regex.test(clean)) {
            return item.platform;
        }
    }

    if (GENERIC_TLD_REGEX.test(clean)) {
        return 'outros';
    }

    return 'outros';
}

/**
 * Só o endereço que aparece depois de https:// (ou http://), até a primeira barra.
 * "https://chat.whatsapp.com/ABC" -> "chat.whatsapp.com"
 */
function dominioDoLink(url = '') {
    return String(url).replace(/^[a-z]+:\/\//i, '').split('/')[0];
}

// Nome que o painel do antilink mostra para as plataformas do WhatsApp
const ROTULO_PLATAFORMA = {
    whatsapp: 'WhatsApp (grupo)',
    canal: 'WhatsApp Canal',
    whatsapp_dm: 'WhatsApp (DM / conversa privada)'
};

/**
 * Se o anti-link bloqueia a plataforma no grupo.
 * DM começa liberado: só bloqueia quando o admin liga `.antilink dm on`.
 * As demais seguem o padrão antigo: sem config, bloqueia.
 */
function plataformaBloqueada(platforms, plataforma) {
    if (plataforma === 'whatsapp_dm') return platforms?.whatsapp_dm === true;
    return platforms ? platforms[plataforma] !== false : true;
}

module.exports = {
    containsLink,
    detectLinkPlatform,
    dominioDoLink,
    normalizeSneakySpacing,
    plataformaBloqueada,
    ROTULO_PLATAFORMA,
    PLATFORM_PATTERNS
};
