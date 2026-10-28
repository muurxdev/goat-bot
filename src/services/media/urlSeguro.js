/**
 * Conferência de link antes de o bot sair buscando alguma coisa na internet.
 *
 * O projeto já tinha `validateUrl` (em mediaResolver), que barra localhost, IP
 * de rede interna e o endereço de metadados da nuvem. O problema achado na
 * auditoria de 2026-09-17 foi outro: vários serviços decidiam "isto é um link do
 * Pinterest/Kwai" com `/pinterest\.com/.test(texto)` — um teste de PEDAÇO DE
 * TEXTO, não de endereço. Então `https://servidor-do-atacante.tld/x?ref=pinterest.com`
 * passava, e a VPS fazia a requisição para onde o atacante quisesse.
 *
 * Aqui o host é comparado como host: igual ao domínio ou subdomínio dele.
 */

const net = require('net')
const dns = require('dns').promises
const logger = require('../../core/logger')

/** Teto de saltos de redirecionamento. Sem isso, um servidor que responde 302 para si mesmo prende o bot num laço eterno. */
const MAX_REDIRECIONAMENTOS = 5

/**
 * Faixas que NUNCA são destino válido: a própria máquina, a rede interna, o
 * endereço de metadados da nuvem e equivalentes em IPv6. Checagem por faixa de
 * IP (net.BlockList), não por texto — "127.0.0.2" e "[::ffff:127.0.0.1]"
 * passavam pela lista antiga, que comparava strings.
 */
const INTERNAS = new net.BlockList()
for (const [rede, bits] of [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
    ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4]
]) INTERNAS.addSubnet(rede, bits, 'ipv4')
for (const [rede, bits] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]]) INTERNAS.addSubnet(rede, bits, 'ipv6')

/** IP (v4 ou v6, com ou sem colchetes) dentro de uma faixa interna? */
function ipInterno(ip) {
    const limpo = String(ip || '').replace(/^\[|\]$/g, '')
    const tipo = net.isIP(limpo)
    if (!tipo) return false
    if (tipo === 6) {
        // IPv4 embutido em IPv6 (::ffff:127.0.0.1 / ::ffff:7f00:1): confere o IPv4.
        const m = limpo.toLowerCase().match(/^::ffff:(?:(\d+\.\d+\.\d+\.\d+)|([0-9a-f]{1,4}):([0-9a-f]{1,4}))$/)
        if (m) {
            const v4 = m[1] || [parseInt(m[2], 16) >> 8, parseInt(m[2], 16) & 255, parseInt(m[3], 16) >> 8, parseInt(m[3], 16) & 255].join('.')
            return INTERNAS.check(v4, 'ipv4')
        }
        return INTERNAS.check(limpo, 'ipv6')
    }
    return INTERNAS.check(limpo, 'ipv4')
}

/**
 * O host (sem resolver DNS) aponta para dentro? IP interno, "localhost" e nome
 * SEM PONTO — na VPS os containers vizinhos se chamam "bgutil_pot_provider" e
 * "goat_whisper", e o DNS do Docker resolve esses nomes para a rede interna.
 * @param {string} hostname
 * @returns {boolean}
 */
function hostInterno(hostname) {
    const h = String(hostname || '').toLowerCase().replace(/\.$/, '')
    if (!h) return true
    if (net.isIP(h.replace(/^\[|\]$/g, ''))) return ipInterno(h)
    if (!h.includes('.')) return true
    return /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain)$/.test(h)
}

/**
 * Conferência completa, com DNS: o nome pode ser público e apontar para um IP
 * interno (127.0.0.1.nip.io, ou um domínio do atacante). Resolve TODOS os
 * endereços do nome e recusa se qualquer um for interno.
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function urlSeguraResolvida(url) {
    if (!urlSegura(url)) return false
    let host
    try { host = new URL(String(url).trim()).hostname.replace(/^\[|\]$/g, '') } catch (err) {
        logger.debug(`[URL SEGURO] Endereço ilegível: ${err.message}`)
        return false
    }
    if (net.isIP(host)) return !ipInterno(host)
    try {
        const enderecos = await dns.lookup(host, { all: true, verbatim: true })
        if (!enderecos.length) return false
        const interno = enderecos.find(e => ipInterno(e.address))
        if (interno) {
            logger.warn(`[URL SEGURO] ${host} resolve para endereço interno (${interno.address}); recusado.`)
            return false
        }
        return true
    } catch (err) {
        logger.debug(`[URL SEGURO] Não resolvi ${host}: ${err.message}`)
        return false
    }
}

/**
 * fetch que segue redirecionamento À MÃO, conferindo cada salto. Com
 * `redirect: 'follow'` um encurtador público podia redirecionar para
 * http://127.0.0.1:3000 e o bot ia junto.
 * @param {string} url
 * @param {object} [opcoes] opções do fetch (method, signal, headers…)
 * @returns {Promise<{ resposta: Response, destino: string, saltos: number }>}
 */
async function buscarComSeguranca(url, opcoes = {}) {
    let atual = String(url).trim()
    for (let saltos = 0; saltos <= MAX_REDIRECIONAMENTOS; saltos++) {
        if (!(await urlSeguraResolvida(atual))) {
            throw Object.assign(new Error('Esse link leva a um endereço interno, que eu não acesso.'), { code: 'SECURITY_VIOLATION', paraUsuario: true })
        }
        const resposta = await fetch(atual, { ...opcoes, redirect: 'manual' })
        const local = resposta.headers.get('location')
        if (resposta.status >= 300 && resposta.status < 400 && local) {
            atual = new URL(local, atual).toString()
            continue
        }
        return { resposta, destino: atual, saltos }
    }
    throw Object.assign(new Error(`O link redirecionou mais de ${MAX_REDIRECIONAMENTOS} vezes.`), { paraUsuario: true })
}

/**
 * O link aponta mesmo para um destes domínios?
 * @param {string} url
 * @param {string[]} hosts domínios permitidos, ex.: ['pinterest.com', 'pin.it']
 * @returns {boolean}
 */
function ehHostDe(url, hosts = []) {
    try {
        const t = String(url || '').trim()
        if (!/^https?:\/\//i.test(t)) return false
        const host = new URL(t).hostname.toLowerCase().replace(/\.$/, '')
        return hosts.some(h => {
            const alvo = String(h).toLowerCase()
            return host === alvo || host.endsWith('.' + alvo)
        })
    } catch (err) {
        logger.debug(`[URL SEGURO] Não consegui ler o endereço "${url}": ${err.message}`)
        return false
    }
}

/**
 * Link seguro para o bot buscar: é http/https e não aponta para dentro da
 * própria máquina nem para a rede interna da VPS.
 * @param {string} url
 * @returns {boolean}
 */
function urlSegura(url) {
    try {
        const { validateUrl } = require('./mediaResolver')
        return validateUrl(String(url || ''))
    } catch (err) {
        logger.warn(`[URL SEGURO] Falha ao conferir "${url}": ${err.message}`)
        return false
    }
}

/**
 * Junta as duas conferências: precisa ser um dos domínios esperados E seguro.
 * @param {string} url
 * @param {string[]} hosts
 * @returns {boolean}
 */
function linkPermitido(url, hosts = []) {
    return ehHostDe(url, hosts) && urlSegura(url)
}

module.exports = { ehHostDe, urlSegura, linkPermitido, hostInterno, ipInterno, urlSeguraResolvida, buscarComSeguranca, MAX_REDIRECIONAMENTOS }
