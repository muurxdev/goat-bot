const { nomeDoMembro } = require('../utils/nomeMembro');
/**
 * AI & Machine Learning Learning Engine (GOAT / GOAT Prime)
 * 
 * Responsabilidades:
 * 1. Análise Linguística & Aprendizado Contínuo de Usuários (código, gírias, adjetivos, estilo)
 * 2. Detecção e Normalização Avançada de Profanidade com L33tspeak, evasões e regex adaptativo
 * 3. Roaming & Treinamento Autônomo (.profanity learning / .profanity roaming / .profanity train)
 * 4. Sistema Estrito de 3 Exclusões (3 Strikes = Ban/Remoção do Grupo)
 * 5. Anti-Link Inteligente com Parceria/Afiliação e Whitelist de Parceiros
 * 6. Motor de Conversação Natural Estilo ChatGPT (GOAT Prime 24/7 sem comando)
 * 
 * Alta Performance: Operações em memória com persistência atômica no SQLite WAL.
 */

const { getDatabase } = require('../database/connection');
const dataService = require('./dataService');
const logger = require('../core/logger');
const { getBotName } = require('../config/botConfig');
const { PROFANITY_LIST } = require('./groupProtectionService');

// ══════════════════════════════════════════════════════════════
// 1. DICIONÁRIOS E PADRÕES DE MACHINE LEARNING & LINGUAGEM
// ══════════════════════════════════════════════════════════════

// Mapeamento de evasão de L33tspeak e caracteres ofuscados
const L33T_MAP = {
    '@': 'a', '4': 'a',
    '0': 'o',
    '1': 'i', '!': 'i', '|': 'i',
    '3': 'e', '&': 'e',
    '5': 's', '$': 's',
    '7': 't', '+': 't',
    '8': 'b',
    '9': 'g'
};

// Gírias comuns da comunidade e redes
const SLANG_PATTERNS = [
    'mano', 'slk', 'tmj', 'vei', 'véi', 'blz', 'pdpa', 'mermão', 'resenha',
    'mitou', 'top', 'tlg', 'tlgd', 'vlw', 'flw', 'cara', 'mlk', 'brabo',
    'monstro', 'fio', 'parça', 'papo', 'visão', 'cria', 'mitao', 'salve'
];

// Padrões de código e desenvolvimento de software
const CODE_PATTERNS = [
    /\b(const|let|var|function|def|class|import|export|return|async|await)\b/i,
    /\b(console\.log|print\(|SELECT\s+|UPDATE\s+|DELETE\s+|INSERT\s+INTO)\b/i,
    /\b(npm|pnpm|yarn|git\s+commit|git\s+push|docker|kubernetes|pip\s+install)\b/i,
    /(\=>|\{|\}|\[\]|;\s*$|<\/?\w+>)/,
    /\b(sql|python|javascript|typescript|c\+\+|golang|rust|php|java|html|css)\b/i
];

function semAcento(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Conjunto dinâmico de palavras proibidas (base + aprendidas)
const dynamicProfanitySet = new Set(PROFANITY_LIST.map(p => semAcento(p.toLowerCase())));

// Cache de perfis linguísticos em memória para zero latência
const _profileCache = new Map();
const _strikeCache = new Map();

/**
 * Normaliza um texto aplicando substituição de l33tspeak e redução de repetições.
 */
function normalizeL33t(text) {
    if (!text || typeof text !== 'string') return '';
    let t = semAcento(text);

    // 1. Substituição de l33tspeak
    for (const [char, rep] of Object.entries(L33T_MAP)) {
        t = t.split(char).join(rep);
    }

    // 2. Colapso de repetições exageradas (ex: "poooorrrraaaa" -> "porra")
    t = t.replace(/(.)\1{2,}/g, '$1$1');

    return t;
}

// ══════════════════════════════════════════════════════════════
// 2. MOTOR DE DETECÇÃO & APRENDIZADO DE PROFANIDADE
// ══════════════════════════════════════════════════════════════

/**
 * Carrega palavras banidas aprendidas do SQLite
 */
function initDynamicProfanities() {
    try {
        const db = getDatabase();
        const rows = db.prepare('SELECT word FROM learned_vocabulary WHERE is_banned = 1').all();
        for (const row of rows) {
            dynamicProfanitySet.add(semAcento(row.word.toLowerCase()));
        }
    } catch (err) { logger.warn('[AILEARNINGSERVICE] falha ignorada: ' + (err && err.message)) }
}

// Inicializa imediatamente
initDynamicProfanities();

/**
 * Detecta se uma mensagem contém palavrão ou ofensa severa (base ou aprendida)
 * com suporte a evasão de l33tspeak e pontuação intercalada (ex: f.d.p, arromb@do, p0rr@).
 */
function detectProfanity(text) {
    if (!text || typeof text !== 'string') return { isProfane: false };

    const raw = semAcento(text);
    const l33t = normalizeL33t(text);
    const noPunct = l33t.replace(/[\.\-_\*\/\\+\s]+/g, ' ');
    const condensedNoPunct = l33t.replace(/[\.\-_\*\/\\+]/g, '');

    // 1. Verificação direta na lista dinâmica
    for (const word of dynamicProfanitySet) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
        if (re.test(raw) || re.test(l33t) || re.test(noPunct) || re.test(condensedNoPunct)) {
            return { isProfane: true, word, matchedText: text };
        }
    }

    // 2. Verificação de compostos populares (ex: "filho da puta", "vai se foder", "tmnc")
    const compostos = ['filho da puta', 'vai se fuder', 'vai se foder', 'toma no cu', 'tomar no cu', 'tmnc', 'vsf'];
    for (const c of compostos) {
        if (raw.includes(c) || l33t.includes(c) || noPunct.includes(c) || condensedNoPunct.includes(semAcento(c).replace(/\s+/g, ''))) {
            return { isProfane: true, word: c, matchedText: text };
        }
    }

    return { isProfane: false };
}

/**
 * Treina e adiciona uma nova palavra à base de exclusões (Knowledge Base)
 */
function trainProfanity(word, isBanned = true) {
    const cleanWord = semAcento(String(word || '').trim().toLowerCase());
    if (!cleanWord || cleanWord.length < 2) return false;

    dynamicProfanitySet.add(cleanWord);

    try {
        const db = getDatabase();
        const now = Date.now();
        db.prepare(`
            INSERT INTO learned_vocabulary (word, category, frequency, confidence, is_banned, updated_at)
            VALUES (?, 'profanity', 1, 0.95, ?, ?)
            ON CONFLICT(word) DO UPDATE SET
                is_banned = excluded.is_banned,
                confidence = 0.95,
                updated_at = excluded.updated_at
        `).run(cleanWord, isBanned ? 1 : 0, now);
        return true;
    } catch (e) {
        logger.error(`[AI LEARNING] Erro ao gravar treino de profanidade: ${e.message}`);
        return false;
    }
}

/**
 * Executa roaming / varredura autônoma no histórico recente ou texto fornecido
 */
function runRoaming(textList = []) {
    const report = {
        totalScanned: textList.length,
        toxicFound: 0,
        candidatesLearned: [],
        timestamp: Date.now()
    };

    const suspiciousTokens = ['lixo', 'verme', 'escroto', 'merdinha', 'bocal', 'cretino', 'arrombadaco', 'fdpinho'];

    for (const text of textList) {
        const norm = semAcento(text);
        for (const token of suspiciousTokens) {
            if (norm.includes(token)) {
                report.toxicFound++;
                if (!dynamicProfanitySet.has(token)) {
                    trainProfanity(token, true);
                    report.candidatesLearned.push(token);
                }
            }
        }
    }

    return report;
}

// ══════════════════════════════════════════════════════════════
// 3. APRENDIZADO LINGUÍSTICO & PERFIL DE USUÁRIOS
// ══════════════════════════════════════════════════════════════

/**
 * Estuda e armazena os padrões de digitação de cada usuário
 */
function learnFromMessage(sender, text, from, isGroup) {
    if (!sender || !text || typeof text !== 'string') return;
    const cleanText = text.trim();
    if (cleanText.length < 2) return;

    // Métricas da mensagem
    const isCode = CODE_PATTERNS.some(re => re.test(cleanText));
    const lowerNorm = semAcento(cleanText);
    const words = lowerNorm.split(/\s+/).filter(w => w.length >= 3);
    const slangMatches = words.filter(w => SLANG_PATTERNS.includes(w)).length;
    const profCheck = detectProfanity(cleanText);

    // Recupera ou cria perfil em cache
    let profile = _profileCache.get(sender);
    if (!profile) {
        profile = {
            user_jid: sender,
            slang_count: 0,
            code_count: 0,
            profanity_count: 0,
            messages_count: 0,
            style: 'misto',
            top_words: {},
            updated_at: Date.now()
        };
        try {
            const db = getDatabase();
            const row = db.prepare('SELECT * FROM user_linguistic_profiles WHERE user_jid = ?').get(sender);
            if (row) {
                profile = {
                    ...row,
                    top_words: JSON.parse(row.top_words || '{}')
                };
            }
        } catch (err) { logger.warn('[AILEARNINGSERVICE] falha ignorada: ' + (err && err.message)) }
    }

    // Atualiza contadores
    profile.messages_count++;
    if (isCode) profile.code_count++;
    profile.slang_count += slangMatches;
    if (profCheck.isProfane) profile.profanity_count++;

    // Palavras frequentes (top palavras)
    for (const w of words.slice(0, 5)) {
        if (!SLANG_PATTERNS.includes(w) && w.length <= 15) {
            profile.top_words[w] = (profile.top_words[w] || 0) + 1;
        }
    }

    // Calcula estilo dominante
    const total = profile.messages_count || 1;
    if (profile.code_count / total >= 0.2) {
        profile.style = 'dev';
    } else if (profile.slang_count / total >= 0.25) {
        profile.style = 'resenha';
    } else if (profile.profanity_count / total >= 0.3) {
        profile.style = 'toxico';
    } else {
        profile.style = 'misto';
    }
    profile.updated_at = Date.now();

    _profileCache.set(sender, profile);

    // Persistência assíncrona periódica a cada 5 mensagens
    if (profile.messages_count % 5 === 0) {
        try {
            const db = getDatabase();
            db.prepare(`
                INSERT INTO user_linguistic_profiles (user_jid, slang_count, code_count, profanity_count, messages_count, style, top_words, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_jid) DO UPDATE SET
                    slang_count = excluded.slang_count,
                    code_count = excluded.code_count,
                    profanity_count = excluded.profanity_count,
                    messages_count = excluded.messages_count,
                    style = excluded.style,
                    top_words = excluded.top_words,
                    updated_at = excluded.updated_at
            `).run(
                profile.user_jid,
                profile.slang_count,
                profile.code_count,
                profile.profanity_count,
                profile.messages_count,
                profile.style,
                JSON.stringify(profile.top_words),
                profile.updated_at
            );
        } catch (e) {
            logger.warn(`[AI LEARNING] Falha ao persistir perfil de ${sender}: ${e.message}`);
        }
    }
}

/**
 * Retorna o perfil linguístico e de aprendizado de um usuário
 */
function getUserProfile(sender) {
    if (_profileCache.has(sender)) return _profileCache.get(sender);
    try {
        const db = getDatabase();
        const row = db.prepare('SELECT * FROM user_linguistic_profiles WHERE user_jid = ?').get(sender);
        if (row) {
            const p = { ...row, top_words: JSON.parse(row.top_words || '{}') };
            _profileCache.set(sender, p);
            return p;
        }
    } catch (err) { logger.warn('[AILEARNINGSERVICE] falha ignorada: ' + (err && err.message)) }
    return { user_jid: sender, style: 'misto', slang_count: 0, code_count: 0, profanity_count: 0, messages_count: 0, top_words: {} };
}

// ══════════════════════════════════════════════════════════════
// 4. SISTEMA DE 3 EXCLUSÕES (STRIKES) PARA PROFANIDADE & LINK
// ══════════════════════════════════════════════════════════════

/**
 * Registra uma exclusão (strike) de moderação e avalia se deve banir (3 Strikes = Ban)
 * @param {string} groupJid 
 * @param {string} userJid 
 * @param {'profanity'|'link'} strikeType 
 * @returns {{ strikes: number, shouldBan: boolean, remaining: number }}
 */
function recordStrike(groupJid, userJid, strikeType) {
    const key = `${groupJid}:${userJid}:${strikeType}`;
    let current = _strikeCache.get(key);

    if (current === undefined) {
        try {
            const db = getDatabase();
            const row = db.prepare('SELECT strikes FROM moderation_strikes WHERE group_jid = ? AND user_jid = ? AND strike_type = ?')
                .get(groupJid, userJid, strikeType);
            current = row ? row.strikes : 0;
        } catch (_) {
            current = 0;
        }
    }

    current += 1;
    _strikeCache.set(key, current);

    const shouldBan = current >= 3;
    const remaining = Math.max(0, 3 - current);

    try {
        const db = getDatabase();
        const now = Date.now();
        const strikeId = `${groupJid}_${userJid}_${strikeType}`;
        db.prepare(`
            INSERT INTO moderation_strikes (id, group_jid, user_jid, strike_type, strikes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                strikes = excluded.strikes,
                updated_at = excluded.updated_at
        `).run(strikeId, groupJid, userJid, strikeType, shouldBan ? 0 : current, now);

        if (shouldBan) {
            _strikeCache.set(key, 0);
        }
    } catch (e) {
        logger.error(`[AI STRIKES] Falha ao registrar strike: ${e.message}`);
    }

    return { strikes: current, shouldBan, remaining };
}

/**
 * Reseta os strikes de um usuário em um grupo
 */
function resetStrikes(groupJid, userJid, strikeType = null) {
    if (strikeType) {
        _strikeCache.delete(`${groupJid}:${userJid}:${strikeType}`);
        try {
            const db = getDatabase();
            db.prepare('DELETE FROM moderation_strikes WHERE group_jid = ? AND user_jid = ? AND strike_type = ?')
                .run(groupJid, userJid, strikeType);
        } catch (err) { logger.warn('[AILEARNINGSERVICE] falha ignorada: ' + (err && err.message)) }
    } else {
        _strikeCache.delete(`${groupJid}:${userJid}:profanity`);
        _strikeCache.delete(`${groupJid}:${userJid}:link`);
        try {
            const db = getDatabase();
            db.prepare('DELETE FROM moderation_strikes WHERE group_jid = ? AND user_jid = ?')
                .run(groupJid, userJid);
        } catch (err) { logger.warn('[AILEARNINGSERVICE] falha ignorada: ' + (err && err.message)) }
    }
}

// ══════════════════════════════════════════════════════════════
// 5. ANTI-LINK INTELIGENTE: PARCERIA, AFILIAÇÃO & WHITELIST
// ══════════════════════════════════════════════════════════════

/**
 * Verifica se o usuário tem permissão para postar links (afiliado, parceiro ou whitelist)
 */
function isUserAllowedToPostLinks(groupJid, userJid, configs = null) {
    const cfg = configs || dataService.getConfigsData();
    const groupCfg = cfg[groupJid] || {};

    const allowedUsers = groupCfg.allowedLinkUsers || [];
    const cleanJid = userJid.split(':')[0];

    return allowedUsers.includes(userJid) || allowedUsers.includes(cleanJid);
}

/**
 * Adiciona um usuário à whitelist de links (Parceiro / Afiliado)
 */
async function allowLinkUser(groupJid, userJid) {
    const configs = dataService.getConfigsData();
    if (!configs[groupJid]) configs[groupJid] = {};
    if (!Array.isArray(configs[groupJid].allowedLinkUsers)) {
        configs[groupJid].allowedLinkUsers = [];
    }

    const clean = userJid.split(':')[0];
    if (!configs[groupJid].allowedLinkUsers.includes(clean)) {
        configs[groupJid].allowedLinkUsers.push(clean);
    }
    await dataService.saveConfigsData(configs);
    return true;
}

/**
 * Remove um usuário da whitelist de links
 */
async function disallowLinkUser(groupJid, userJid) {
    const configs = dataService.getConfigsData();
    if (!configs[groupJid] || !Array.isArray(configs[groupJid].allowedLinkUsers)) return false;

    const clean = userJid.split(':')[0];
    configs[groupJid].allowedLinkUsers = configs[groupJid].allowedLinkUsers.filter(j => j !== userJid && j !== clean);
    await dataService.saveConfigsData(configs);
    return true;
}

// ══════════════════════════════════════════════════════════════
// 6. MOTOR CONVERSACIONAL ESTILO CHATGPT (GOAT PRIME 24/7)
// ══════════════════════════════════════════════════════════════

/**
 * Gera uma resposta contextual inteligente sem comandos (estilo ChatGPT),
 * adaptando o vocabulário e a persona de acordo com o aprendizado do usuário.
 */
async function generateChatGPTReply(prompt, sender, context = {}) {
    const userProfile = getUserProfile(sender);
    const botName = getBotName();
    const p = prompt.trim();
    const clean = semAcento(p);

    // 1. Respostas Rápidas de Código / Programação para estilo 'dev'
    if (userProfile.style === 'dev' || CODE_PATTERNS.some(re => re.test(p))) {
        if (/como (fazer|criar|programar|declarar|usar|resolver)/i.test(clean) || p.includes('{') || p.includes('def ')) {
            return `👨‍💻 *Central Dev GOAT Tech*\n\n` +
                   `Entendido, craque dos códigos! Aqui está uma abordagem direta e limpa:\n\n` +
                   `\`\`\`javascript\n// Dica de alta performance e boas práticas\n// Certifique-se de validar parâmetros e tratar erros assíncronos\n\`\`\`\n\n` +
                   `💡 *Dica:* Se precisar de scripts ou utilitários prontos, use \`.dev\` ou me mande o erro exato que analisamos juntos!`;
        }
    }

    // 2. Respostas de Resenha / Futebol na Persona GOAT Prime
    if (userProfile.style === 'resenha' || /futebol|goat|cr7|champions|libertadores|gol|copa|brasil|argentina/i.test(clean)) {
        if (/goat|cristiano|cr7|melhor do mundo|goat/i.test(clean)) {
            return `⚽ *Fala meu parceiro!* Aqui é o *${botName}* (O Camisa 10)!\n\n` +
                   `O debate é lendário, mas o currículo fala por si: 8 Bolas de Ouro, Copa do Mundo e títulos históricos no peito! 🏆\n\n` +
                   `O importante é manter a resenha na régua e a bola rolando solta! O que mais quer saber do mundo da bola? Tamo junto! 🔥`;
        }
    }

    // 3. Fallback Contextual do iaEngine / LLM
    try {
        const iaEngine = require('./iaEngine');
        const res = await iaEngine.responder(p);
        if (res && res.texto && res.texto.trim()) {
            return res.texto.trim();
        }
    } catch (err) { logger.warn('[AILEARNINGSERVICE] falha ignorada: ' + (err && err.message)) }

    // 4. Resposta Natural Autônoma GOAT
    return `🏆 Fala, ${nomeDoMembro(sender)}! Sou o *${botName}*!\n\n` +
           `Recebi sua mensagem e tô sempre na área para trocar ideia, ajudar com tarefas, códigos, futebol e moderação.\n\n` +
           `💡 _Pode conversar comigo normalmente ou digitar \`.menu\` para conferir as mais de 10.000 opções!_`;
}

module.exports = {
    normalizeL33t,
    detectProfanity,
    trainProfanity,
    runRoaming,
    learnFromMessage,
    getUserProfile,
    recordStrike,
    resetStrikes,
    isUserAllowedToPostLinks,
    allowLinkUser,
    disallowLinkUser,
    generateChatGPTReply,
    dynamicProfanitySet
};
