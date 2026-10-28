/**
 * Utility: Argumentos Centralizados do yt-dlp
 *
 * Garante que todas as chamadas (metadata, download, pesquisa) usem a mesma
 * estratégia de autenticação e robustez:
 *  - Cookies por usuário (data/cookies/<jid>.txt) quando disponível
 *  - Fallback para cookies globais (data/cookies.txt ou YOUTUBE_COOKIES_FILE)
 *  - Fallback entre múltiplos "player clients" do YouTube (bypass parcial do
 *    bloqueio "Sign in to confirm you're not a bot" de IPs de datacenter)
 */

const fs = require('fs')
const path = require('path')
const { dataDir } = require('../../config/paths')
const logger = require('../../core/logger')

const COOKIES_FILE = process.env.YOUTUBE_COOKIES_FILE
    ? path.resolve(process.env.YOUTUBE_COOKIES_FILE)
    : path.join(dataDir, 'cookies.txt')

const COOKIES_DIR = path.join(dataDir, 'cookies')

if (!fs.existsSync(COOKIES_DIR)) {
    try {
        fs.mkdirSync(COOKIES_DIR, { recursive: true })
    } catch (err) {
        logger.error(`[MEDIA ARGS] Não consegui criar a pasta de cookies : `)
    }
}

function sanitizeJid(jid) {
    if (!jid || typeof jid !== 'string') return ''
    return jid.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_')
}

function getCookiesFilePath() {
    return process.env.YOUTUBE_COOKIES_FILE
        ? path.resolve(process.env.YOUTUBE_COOKIES_FILE)
        : path.join(dataDir, 'cookies.txt')
}

function getCookiesPathFor(userJid) {
    if (userJid) {
        const safeName = sanitizeJid(userJid)
        if (safeName) {
            const userPath = path.join(COOKIES_DIR, `${safeName}.txt`)
            if (fileHasCookies(userPath)) {
                logger.debug(`[MEDIA ARGS] Usando cookies do usuário: ${safeName}`)
                return userPath
            }
        }
    }
    // O cookie de uma pessoa vale só para os downloads DELA.
    //
    // Antes, se o arquivo global estivesse incompleto, o bot promovia "o melhor
    // arquivo de usuário" a cookie de todo mundo. Como `.cookies` não pede
    // permissão nenhuma, qualquer membro de grupo conseguia, com uma mensagem,
    // fazer o bot inteiro navegar no YouTube com a conta dele — inclusive uma
    // conta que ele controla e observa. Achado na auditoria de 2026-09-17.
    if (!fileHasCookies(COOKIES_FILE)) return null
    return COOKIES_FILE
}

function getCookiesPath() {
    return getCookiesPathFor(null)
}

const YOUTUBE_CLIENTS = process.env.YOUTUBE_CLIENTS || 'ios,tv,android,default,web_embedded'
const YOUTUBE_PO_TOKEN = process.env.YOUTUBE_PO_TOKEN || ''
const EXTRA_EXTRACTOR_ARGS = process.env.YTDLP_EXTRACTOR_ARGS || ''
const PLUGIN_DIR = process.env.YTDLP_PLUGIN_DIR || '/app/ytdlp_plugins'
const JS_RUNTIME = process.env.YTDLP_JS_RUNTIME || 'node'
const PO_TOKEN_PROVIDER = process.env.PO_TOKEN_PROVIDER || ''
// Nome do serviço no docker-compose (bgutil-pot-provider, container bgutil_pot_provider).
const POT_PROVIDER_URL = process.env.YTDLP_POT_PROVIDER_URL ?? 'http://bgutil_pot_provider:4416'

function getYtDlpEnv() {
    const env = { ...process.env }
    if (PO_TOKEN_PROVIDER) env.PO_TOKEN_PROVIDER = PO_TOKEN_PROVIDER
    return env
}

function fileHasCookies(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return false
    try {
        const head = fs.readFileSync(filePath, 'utf8').slice(0, 4000)
        return /netscape|http\.only|\.youtube\.com|\.tiktok\.com|\.instagram\.com/i.test(head)
    } catch (err) {
        logger.warn(`[MEDIA ARGS] Não consegui ler ${path.basename(filePath)}: ${err.message}`)
        return false
    }
}

/**
 * Cookies de LOGIN do YouTube que faltam no arquivo. O formato pode estar certo
 * e o login incompleto: em 2026-09-21 o arquivo da VPS tinha só __Secure-3PSID
 * e os PSIDTS, o YouTube tratava a VPS como anônima ("confirme que não é um
 * robô") e o status ainda dizia "definido".
 * @returns {string[]} nomes ausentes (vazio = login completo)
 */
function cookiesYoutubeFaltando(filePath = getCookiesFilePath()) {
    const NECESSARIOS = ['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', 'LOGIN_INFO', '__Secure-1PSID', '__Secure-3PSID']
    try {
        const agora = Date.now() / 1000
        const presentes = new Set(fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
            .map(l => l.replace(/^#HttpOnly_/, '').split('\t'))
            .filter(c => c.length >= 7 && /(^|\.)(youtube|google)\.com$/.test(c[0]) && (Number(c[4]) === 0 || Number(c[4]) > agora))
            .map(c => c[5]))
        return NECESSARIOS.filter(n => !presentes.has(n))
    } catch (err) {
        logger.warn(`[MEDIA ARGS] Não li os cookies para conferir o login: ${err.message}`)
        return NECESSARIOS
    }
}

function validateCookiesFile(filePath = getCookiesFilePath()) {
    if (!filePath || !fs.existsSync(filePath)) {
        return { ok: false, reason: 'AUSENTE', detail: 'crie data/cookies.txt (formato Netscape)' }
    }

    let content = ''
    try {
        const stat = fs.statSync(filePath)
        if (stat.size === 0) {
            return { ok: false, reason: 'VAZIO', detail: 'o arquivo existe mas está vazio' }
        }
        if (stat.size > 2 * 1024 * 1024) {
            return { ok: false, reason: 'GRANDE_DEMAIS', detail: 'máx. 2MB' }
        }
        content = fs.readFileSync(filePath, 'utf8')
    } catch (err) {
        return { ok: false, reason: 'ILEGIVEL', detail: err.message }
    }

    const hasHeader = /netscape|http\.only|# cookies/i.test(content.slice(0, 1000))

    let count = 0
    let domain = null
    // Um arquivo Netscape pode conter VÁRIOS domínios — é o caso normal quando se
    // exporta YouTube + Instagram juntos. Antes só o primeiro era reportado, o que
    // escondia os demais no status do `.cookies`.
    const dominios = new Set()
    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue
        const cols = line.split('\t')
        if (cols.length < 7) continue
        if (!cols[0] || !cols[2] || !cols[5] || !cols[6]) continue
        count += 1
        const m = String(cols[0]).match(/(youtube|tiktok|instagram|facebook|twitter|x)\.com/i)
        if (m) {
            dominios.add(m[1].toLowerCase())
            if (!domain) domain = cols[0]
        }
    }

    if (count === 0) {
        return { ok: false, reason: 'FORMATO_INVALIDO', detail: 'nenhuma linha de cookie Netscape (domínio<TAB>...<TAB>valor) encontrada' }
    }

    if (!hasHeader && !domain) {
        return { ok: false, reason: 'SEM_DOMINIOS_SUPORTADOS', detail: 'sem cookies de youtube/tiktok/instagram' }
    }

    return {
        ok: true,
        reason: 'OK',
        count,
        domain: domain || 'outro',
        // Lista legível de todas as plataformas presentes no arquivo.
        dominios: [...dominios],
        resumoDominios: dominios.size ? [...dominios].join(', ') : 'outro'
    }
}

function buildYtDlpArgs(extra = [], opts = {}) {
    const args = []

    const cookies = getCookiesPathFor(opts.userJid)
    if (cookies) {
        args.push('--cookies', cookies)
    } else {
        logger.debug('[MEDIA ARGS] Nenhum arquivo de cookies válido encontrado. Usando acesso anônimo.')
    }

    if (PLUGIN_DIR && fs.existsSync(PLUGIN_DIR)) {
        args.push('--plugin-dirs', PLUGIN_DIR)
    }

    if (JS_RUNTIME) {
        args.push('--js-runtimes', JS_RUNTIME)
    }

    args.push('--remote-components', 'ejs:github')

    const extractorGroups = []
    const youtubeArgs = []
    if (YOUTUBE_CLIENTS) youtubeArgs.push(`player_client=${YOUTUBE_CLIENTS}`)
    if (YOUTUBE_PO_TOKEN) youtubeArgs.push(`po_token=${YOUTUBE_PO_TOKEN}`)
    if (youtubeArgs.length > 0) extractorGroups.push(`youtube:${youtubeArgs.join(';')}`)
    // Plugin de PO Token: sem o base_url o plugin procura o gerador em
    // 127.0.0.1, que dentro do container do bot não é o bgutil. Não resolve
    // sozinho o "Sign in to confirm you're not a bot": em 2026-09-15 os vídeos
    // barrados continuaram barrados com ele; o que faltava eram cookies de conta
    // logada (LOGIN_INFO/SID/SAPISID) em data/cookies.txt.
    if (POT_PROVIDER_URL && PLUGIN_DIR && fs.existsSync(PLUGIN_DIR)) {
        extractorGroups.push(`youtubepot-bgutilhttp:base_url=${POT_PROVIDER_URL}`)
    }
    if (EXTRA_EXTRACTOR_ARGS) extractorGroups.push(EXTRA_EXTRACTOR_ARGS)

    // Um --extractor-args por extrator. Juntar com vírgula quebrava: a vírgula
    // já separa os valores de player_client (ios,tv,...), então o grupo seguinte
    // virava mais um "cliente" do YouTube.
    for (const grupo of extractorGroups) {
        args.push('--extractor-args', grupo)
    }

    args.push(...extra)

    return args
}

/**
 * Deixa o conteúdo no formato Netscape que o yt-dlp aceita.
 *
 * O yt-dlp é tudo ou nada: basta a PRIMEIRA linha não ser o cabeçalho para ele
 * recusar o arquivo inteiro com "does not look like a Netscape format cookies
 * file" e todo download do YouTube cair no caminho reserva. Foi o que aconteceu
 * na VPS: alguém mandou `.setcookies global <conteúdo>` e a palavra "global"
 * grudou no começo do arquivo, derrubando o YouTube por dias sem erro visível.
 *
 * @param {string} content
 * @returns {string} conteúdo pronto para gravar
 */
function sanitizarCookies(content) {
    const linhas = String(content || '').replace(/\r\n?/g, '\n').split('\n')
    const limpas = []
    for (const linha of linhas) {
        const l = linha.replace(/\s+$/, '')
        if (!l.trim()) continue
        if (l.trim().startsWith('#')) {
            // O lixo pode ter grudado no cabeçalho: "global # Netscape..."
            const i = l.indexOf('#')
            limpas.push(i > 0 ? l.slice(i) : l)
            continue
        }
        // Linha de cookie só vale com as 7 colunas separadas por tabulação.
        if (l.split('\t').length >= 7) limpas.push(l.trim())
    }
    const cabecalho = '# Netscape HTTP Cookie File'
    if (!limpas.length || !/netscape/i.test(limpas[0])) limpas.unshift(cabecalho)
    return limpas.join('\n') + '\n'
}

function saveUserCookies(userJid, content) {
    if (!userJid || !content || typeof content !== 'string') return false
    const safeName = sanitizeJid(userJid)
    if (!safeName) return false
    try {
        const filePath = path.join(COOKIES_DIR, `${safeName}.txt`)
        fs.writeFileSync(filePath, sanitizarCookies(content), 'utf8')
        logger.info(`[MEDIA ARGS] Cookies do usuário ${safeName} salvos com sucesso.`)
        return true
    } catch (err) {
        logger.error(`[MEDIA ARGS] Erro ao salvar cookies do usuário ${safeName}: ${err.message}`)
        return false
    }
}

function removeUserCookies(userJid) {
    if (!userJid) return false
    const safeName = sanitizeJid(userJid)
    if (!safeName) return false
    try {
        const filePath = path.join(COOKIES_DIR, `${safeName}.txt`)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            logger.info(`[MEDIA ARGS] Cookies do usuário ${safeName} removidos.`)
            return true
        }
        return false
    } catch (err) {
        logger.error(`[MEDIA ARGS] Erro ao remover cookies do usuário ${safeName}: ${err.message}`)
        return false
    }
}

function getCookieStatus(userJid) {
    const global = validateCookiesFile(COOKIES_FILE)
    let user = null
    if (userJid) {
        const safeName = sanitizeJid(userJid)
        const userPath = path.join(COOKIES_DIR, `${safeName}.txt`)
        user = validateCookiesFile(userPath)
    }
    const activePath = getCookiesPathFor(userJid)
    return { global, user, activePath, activeSource: activePath === COOKIES_FILE ? 'global' : 'user' }
}

module.exports = {
    COOKIES_FILE,
    COOKIES_DIR,
    YOUTUBE_CLIENTS,
    YOUTUBE_PO_TOKEN,
    PLUGIN_DIR,
    JS_RUNTIME,
    PO_TOKEN_PROVIDER,
    getCookiesFilePath,
    getCookiesPathFor,
    validateCookiesFile,
    cookiesYoutubeFaltando,
    getYtDlpEnv,
    getCookiesPath,
    fileHasCookies,
    buildYtDlpArgs,
    saveUserCookies,
    removeUserCookies,
    getCookieStatus,
    sanitizeJid,
    sanitizarCookies
}
