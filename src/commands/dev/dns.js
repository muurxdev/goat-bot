/**
 * Comando .dns
 * Consulta registros DNS com segurança (A, AAAA, MX, TXT, NS, CNAME)
 */

const { resolveDnsRecords } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

const TIPOS = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']

/** Traduz o código de erro DNS para uma frase simples. */
function motivo(err, tipo) {
    const m = String(err && err.message || '')
    if (/ENOTFOUND|NXDOMAIN/i.test(m)) return 'Esse domínio não existe ou está escrito errado.'
    if (/ENODATA/i.test(m)) return `O domínio existe, mas não tem registro do tipo ${tipo}.`
    if (/ETIMEOUT|ECONNREFUSED|ESERVFAIL/i.test(m)) return 'O servidor de nomes não respondeu. Tente de novo em instantes.'
    return 'Não consegui fazer a consulta agora. Tente de novo em instantes.'
}

function telaUso(prefix, titulo, intro) {
    return F.tela({
        emoji: '🌐',
        titulo,
        intro,
        secoes: [
            { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'dns', '<domínio> [tipo]')] },
            { emoji: '📚', titulo: 'Tipos aceitos', linhas: [TIPOS.join(', ') + ' (sem tipo, uso A)'] },
            { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                F.cmd(prefix, 'dns', 'google.com') + ' — endereços IPv4',
                F.cmd(prefix, 'dns', 'github.com MX') + ' — servidores de e-mail',
                F.cmd(prefix, 'dns', 'cloudflare.com TXT') + ' — verificações e SPF'
            ]) }
        ],
        proximos: [{ nome: 'dnsrecords', oque: 'o que cada tipo significa' }],
        prefix
    })
}

module.exports = {
    name: 'dns',
    aliases: ["nslookup","dig","dnsquery","cmd_dns","alt_dns","atalho_dns","abrev_dns","call_dns","func_dns"],
    category: 'dev',
    subcategory: 'Rede',
    description: 'Consulta os registros DNS de um domínio (A, AAAA, MX, TXT, NS, CNAME)',
    usage: '<domínio> [tipo]',
    examples: ['google.com — endereços IPv4', 'github.com MX — servidores de e-mail', 'cloudflare.com TXT — registros de texto'],
    cooldownMs: 3000,
    execute: async ({ text, reply, prefix = '.' }) => {
        if (!text) {
            return reply(telaUso(prefix, 'Consulta DNS', 'Mostra para onde um domínio aponta: endereços, e-mail, servidores de nome e mais.'))
        }

        const parts = text.trim().split(/\s+/)
        const domain = parts[0]
        const type = (parts[1] || 'A').toUpperCase()

        if (!TIPOS.includes(type)) {
            return reply(telaUso(prefix, 'Tipo de registro desconhecido', `Não consulto registros do tipo *${type}*.`))
        }

        try {
            const res = await resolveDnsRecords(domain, type)
            const linhas = res.records.slice(0, 20).map((rec, idx) => {
                if (rec && typeof rec === 'object' && !Array.isArray(rec) && rec.exchange) return `${idx + 1}. \`${rec.exchange}\` (prioridade ${rec.priority})`
                if (Array.isArray(rec)) return `${idx + 1}. \`${rec.join('')}\``
                return `${idx + 1}. \`${typeof rec === 'object' ? JSON.stringify(rec) : rec}\``
            })

            await reply(F.tela({
                emoji: '🌐',
                titulo: `Consulta DNS (${res.type})`,
                intro: res.records.length
                    ? `*${res.domain}* tem *${res.records.length}* registro(s) do tipo ${res.type}.`
                    : `*${res.domain}* não tem registros do tipo ${res.type}.`,
                secoes: [{ emoji: '📋', titulo: 'Registros', linhas: linhas.concat(res.records.length > 20 ? [`…e mais ${res.records.length - 20}.`] : []) }],
                proximos: TIPOS.filter(t => t !== res.type).slice(0, 3).map(t => ({ nome: 'dns', args: `${res.domain} ${t}`, oque: `registros ${t}` })),
                prefix
            }))
        } catch (err) {
            logger.warn(`[DNS] Consulta ${type} de "${domain}" falhou: ${err.message}`)
            await reply(F.tela({
                emoji: '🌐',
                titulo: 'Consulta DNS sem resposta',
                intro: motivo(err, type),
                secoes: [{ emoji: '📋', titulo: 'O que tentei', linhas: [F.campo('Domínio', domain), F.campo('Tipo', type)] }],
                proximos: [type !== 'A' ? { nome: 'dns', args: `${domain} A`, oque: 'tentar o tipo A' } : null, { nome: 'whois', args: domain, oque: 'resumo do domínio' }].filter(Boolean),
                prefix
            }))
        }
    }
}
