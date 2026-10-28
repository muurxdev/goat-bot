/**
 * Comando .headers
 * Inspeciona cabeçalhos HTTP de uma URL com proteção SSRF
 */

const { inspectHttpHeaders } = require('../../services/devService')
const F = require('../../utils/formato')
const logger = require('../../core/logger')

/** Traduz a falha do serviço para uma frase simples. */
function motivo(err) {
    const m = String(err && err.message || '')
    if (/SSRF|URL inválida/i.test(m)) return 'Esse endereço é inválido ou aponta para uma rede interna, que eu não consulto por segurança.'
    if (/Tempo limite/i.test(m)) return 'O site demorou mais de 5 segundos para responder.'
    if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return 'Não encontrei esse domínio. Confira se está escrito certo.'
    if (/ECONNREFUSED/i.test(m)) return 'O servidor recusou a conexão.'
    if (/certificate|CERT|SSL|TLS/i.test(m)) return 'O certificado de segurança do site tem problema.'
    return 'Não consegui falar com esse site agora. Tente de novo em instantes.'
}

module.exports = {
    name: 'headers',
    aliases: ["httpheaders","curl-head","cmd_headers","alt_headers","atalho_headers","abrev_headers","call_headers","func_headers"],
    category: 'dev',
    subcategory: 'Rede',
    description: 'Mostra os cabeçalhos HTTP que um site público devolve',
    usage: '<url>',
    examples: ['https://api.github.com — cabeçalhos da API do GitHub', 'https://google.com — cabeçalhos do Google'],
    cooldownMs: 3000,
    execute: async ({ text, reply, prefix = '.' }) => {
        if (!text) {
            return reply(F.tela({
                emoji: '🌐',
                titulo: 'Cabeçalhos HTTP',
                intro: 'Faço uma requisição HEAD ao site e mostro o status e os cabeçalhos da resposta.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'headers', '<url>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'headers', 'https://api.github.com'), F.cmd(prefix, 'headers', 'https://google.com')]) }
                ],
                dica: 'Endereços de rede interna (localhost, 192.168...) são bloqueados por segurança.',
                proximos: [{ nome: 'curlemu', args: 'https://api.github.com', oque: 'testar status e tempo de resposta' }],
                prefix
            }))
        }

        const alvo = text.trim()
        try {
            const res = await inspectHttpHeaders(alvo)
            const h = res.headers || {}
            const bruto = JSON.stringify(h, null, 2)
            const ok = res.statusCode >= 200 && res.statusCode < 400
            await reply(F.tela({
                emoji: '🌐',
                titulo: 'Cabeçalhos HTTP',
                intro: `${ok ? '🟢' : '🔴'} *${res.statusCode} ${res.statusMessage || ''}*`.trim(),
                secoes: [
                    {
                        emoji: '📋', titulo: 'Principais',
                        linhas: [
                            F.campo('URL', alvo),
                            h['content-type'] ? F.campo('Tipo de conteúdo', h['content-type']) : null,
                            h.server ? F.campo('Servidor', h.server) : null,
                            h.location ? F.campo('Redireciona para', h.location) : null,
                            h['cache-control'] ? F.campo('Cache', h['cache-control']) : null,
                            F.campo('Total de cabeçalhos', String(Object.keys(h).length))
                        ]
                    },
                    { emoji: '📦', titulo: 'Todos os cabeçalhos', linhas: ['```json\n' + bruto.slice(0, 1000) + (bruto.length > 1000 ? '\n…' : '') + '\n```'] }
                ],
                dica: res.statusCode >= 300 && res.statusCode < 400 ? 'Status 3xx é redirecionamento: consulte o endereço de "Redireciona para".' : '',
                proximos: [
                    { nome: 'sslcheck', args: alvo.replace(/^https?:\/\//, '').split('/')[0], oque: 'conferir o certificado' },
                    { nome: 'httpstatus', args: String(res.statusCode), oque: 'o que significa esse status' }
                ],
                prefix
            }))
        } catch (err) {
            logger.warn(`[HEADERS] Falha em "${alvo}": ${err.message}`)
            await reply(F.tela({
                emoji: '🌐',
                titulo: 'Não consegui ler os cabeçalhos',
                intro: motivo(err),
                secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'headers', 'https://api.github.com')] }],
                prefix
            }))
        }
    }
}
