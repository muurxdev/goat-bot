/**
 * Developer Utility Service (Dev Hub)
 * Utilitários ativos para engenharia de software, criptografia, encoding, formatação e rede segura
 */

const crypto = require('crypto')
const dns = require('dns').promises
const http = require('http')
const https = require('https')
const { validateUrl } = require('./media/mediaResolver')

/**
 * Formata ou minifica JSON com validação de sintaxe
 */
function processJson(rawInput, mode = 'format') {
    if (!rawInput || typeof rawInput !== 'string') {
        throw new Error('Conteúdo JSON não informado.')
    }

    try {
        const parsed = JSON.parse(rawInput)
        if (mode === 'minify') {
            return JSON.stringify(parsed)
        }
        return JSON.stringify(parsed, null, 2)
    } catch (err) {
        throw new Error(`Sintaxe JSON inválida: ${err.message}`)
    }
}

/**
 * Gera hash criptográfico (MD5, SHA1, SHA256, SHA512)
 */
function generateHash(algorithm = 'sha256', text = '') {
    const validAlgos = ['md5', 'sha1', 'sha256', 'sha512']
    const algo = algorithm.toLowerCase()

    if (!validAlgos.includes(algo)) {
        throw new Error(`Algoritmo não suportado. Algoritmos válidos: ${validAlgos.join(', ')}`)
    }

    if (!text) {
        throw new Error('Texto para geração de hash não informado.')
    }

    return crypto.createHash(algo).update(text, 'utf8').digest('hex')
}

/**
 * Codifica texto para Base64
 */
function encodeBase64(text = '') {
    if (!text) throw new Error('Texto para codificação não informado.')
    return Buffer.from(text, 'utf8').toString('base64')
}

/**
 * Decodifica string Base64 para texto UTF-8
 */
function decodeBase64(base64Str = '') {
    if (!base64Str) throw new Error('String Base64 não informada.')
    try {
        const decoded = Buffer.from(base64Str, 'base64').toString('utf8')
        return decoded
    } catch (err) {
        throw new Error('Falha ao decodificar Base64.')
    }
}

/**
 * Gera um identificador único universal (UUID v4)
 */
function generateUUID() {
    return crypto.randomUUID()
}

/**
 * Decodifica e inspeciona um JSON Web Token (JWT)
 */
function decodeJWT(token = '') {
    if (!token || typeof token !== 'string') {
        throw new Error('Token JWT não informado.')
    }

    const parts = token.trim().split('.')
    if (parts.length < 2) {
        throw new Error('Formato de JWT inválido. O token deve conter pelo menos cabeçalho e payload separados por ponto.')
    }

    try {
        const headerJson = Buffer.from(parts[0], 'base64').toString('utf8')
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8')

        return {
            header: JSON.parse(headerJson),
            payload: JSON.parse(payloadJson),
            signaturePresent: parts.length === 3
        }
    } catch (err) {
        throw new Error(`Erro ao decodificar estrutura do JWT: ${err.message}`)
    }
}

// Teto do que o testador de expressão aceita. A busca roda na única linha de
// execução do bot: um padrão que demora congela TODOS os grupos até o container
// reiniciar. Não existe como interromper uma busca já iniciada no Node, então a
// defesa tem de ser antes de começar.
const REGEX_MAX_PADRAO = 200
const REGEX_MAX_TEXTO = 1000

// Grupo repetido que, por dentro, também repete ou oferece caminhos iguais —
// "(a+)+", "(a|a)*", "(\d*)+", "(x{2,}){3,}". É a forma clássica que faz a busca
// explodir em tempo exponencial. A checagem é conservadora de propósito: barrar
// um padrão inofensivo custa uma reescrita; deixar passar um explosivo derruba o
// bot em todos os grupos.
const REGEX_EXPLOSIVO = /\((?:\?[:=!<][a-z]*)?[^()]*[+*{|][^()]*\)\s*[+*{]/

/**
 * Testa uma expressão regular contra um texto
 * @throws {Error} quando o padrão é perigoso ou a entrada passa do teto
 */
function testRegex(patternStr, flags = '', text = '') {
    if (!patternStr) throw new Error('Padrão Regex não informado.')

    if (patternStr.length > REGEX_MAX_PADRAO) {
        throw new Error(`Padrão longo demais (máx. ${REGEX_MAX_PADRAO} caracteres).`)
    }
    if (String(text || '').length > REGEX_MAX_TEXTO) {
        throw new Error(`Texto de teste longo demais (máx. ${REGEX_MAX_TEXTO} caracteres).`)
    }
    if (REGEX_EXPLOSIVO.test(patternStr)) {
        throw new Error('Esse padrão tem repetição dentro de repetição (algo como "(a+)+"), que pode travar a busca. Reescreva sem o grupo repetido.')
    }

    try {
        const regex = new RegExp(patternStr, flags)
        const match = regex.exec(text)
        // matchAll copia o lastIndex; depois do exec acima ele pularia a primeira ocorrência
        const allMatches = flags.includes('g') ? [...text.matchAll(new RegExp(patternStr, flags))].map(m => m[0]) : null

        return {
            matched: Boolean(match),
            firstMatch: match ? match[0] : null,
            groups: match && match.groups ? match.groups : null,
            allMatches
        }
    } catch (err) {
        throw new Error(`Regex inválido: ${err.message}`)
    }
}

/**
 * Converte timestamp UNIX ou data para múltiplos formatos
 */
function convertTimestamp(input = null) {
    let date = null

    if (!input) {
        date = new Date()
    } else if (/^\d+$/.test(input.trim())) {
        const num = parseInt(input.trim(), 10)
        // Se for em segundos (10 dígitos) converte para ms
        date = num < 10000000000 ? new Date(num * 1000) : new Date(num)
    } else {
        date = new Date(input.trim())
    }

    if (isNaN(date.getTime())) {
        throw new Error('Data ou timestamp inválido.')
    }

    return {
        unixSeconds: Math.floor(date.getTime() / 1000),
        unixMillis: date.getTime(),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        brt: date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    }
}

/**
 * Consulta registros DNS com segurança
 */
async function resolveDnsRecords(domain, type = 'A') {
    if (!domain || typeof domain !== 'string') {
        throw new Error('Domínio não informado.')
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].trim().toLowerCase()
    const validTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']
    const recordType = (type || 'A').toUpperCase()

    if (!validTypes.includes(recordType)) {
        throw new Error(`Tipo de registro DNS inválido. Use: ${validTypes.join(', ')}`)
    }

    try {
        let records = []
        if (recordType === 'A') records = await dns.resolve4(cleanDomain)
        else if (recordType === 'AAAA') records = await dns.resolve6(cleanDomain)
        else if (recordType === 'MX') records = await dns.resolveMx(cleanDomain)
        else if (recordType === 'TXT') records = await dns.resolveTxt(cleanDomain)
        else if (recordType === 'NS') records = await dns.resolveNs(cleanDomain)
        else if (recordType === 'CNAME') records = await dns.resolveCname(cleanDomain)

        return {
            domain: cleanDomain,
            type: recordType,
            records
        }
    } catch (err) {
        throw new Error(`Falha na consulta DNS (${recordType}): ${err.code || err.message}`)
    }
}

/**
 * Inspeciona cabeçalhos HTTP com validação SSRF
 */
async function inspectHttpHeaders(urlString) {
    const { urlSeguraResolvida } = require('./media/urlSeguro')
    if (!validateUrl(urlString) || !(await urlSeguraResolvida(urlString))) {
        throw new Error('URL inválida ou bloqueada por políticas de segurança SSRF.')
    }

    const parsed = new URL(urlString)
    const clientModule = parsed.protocol === 'https:' ? https : http

    return new Promise((resolve, reject) => {
        const req = clientModule.request(urlString, { method: 'HEAD', timeout: 5000 }, (res) => {
            resolve({
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                headers: res.headers
            })
        })

        req.on('timeout', () => {
            req.destroy()
            reject(new Error('Tempo limite de conexão excedido (5s).'))
        })

        req.on('error', (err) => {
            reject(new Error(`Falha na requisição HTTP: ${err.message}`))
        })

        req.end()
    })
}

module.exports = {
    processJson,
    generateHash,
    encodeBase64,
    decodeBase64,
    generateUUID,
    decodeJWT,
    testRegex,
    convertTimestamp,
    resolveDnsRecords,
    inspectHttpHeaders
}
