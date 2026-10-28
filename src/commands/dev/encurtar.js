/**
 * Comando .encurtar
 * Encurtador resiliente de links e URLs com múltiplos provedores em cascata
 */

const shortenerService = require('../../services/shortenerService');
const F = require('../../utils/formato');
const logger = require('../../core/logger');

module.exports = {
    name: "encurtar",
    aliases: ["shortlink","isgd","tinylink","shorturl","cmd_encurtar","alt_encurtar","atalho_encurtar","abrev_encurtar","call_encurtar","func_encurtar"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Encurta links longos e devolve um link curto pronto para compartilhar",
    usage: '<link>',
    examples: ['https://open.spotify.com/track/xxxx — encurta um link completo', 'google.com — funciona sem https', ' — respondendo a uma mensagem com link'],
    execute: async ({ args, reply, quotedMsg, prefix = '.' }) => {
        // Tenta pegar a URL dos argumentos ou do texto da mensagem citada
        let input = (args && args.length > 0) ? args.join(' ').trim() : '';
        if (!input && quotedMsg && quotedMsg.text) {
            input = quotedMsg.text.trim();
        }

        if (!input) {
            return reply(F.tela({
                emoji: '🔗',
                titulo: 'Encurtador de links',
                intro: 'Transformo um link comprido num link curto, fácil de mandar.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: F.lista([F.cmd(prefix, 'encurtar', '<link>'), 'ou responda a uma mensagem com link usando ' + F.cmd(prefix, 'encurtar')]) },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'encurtar', 'https://open.spotify.com/track/...'), F.cmd(prefix, 'encurtar', 'google.com')]) }
                ],
                dica: 'Não precisa escrever https://, eu completo sozinho.',
                prefix
            }));
        }

        // Extrai URL via regex se houver texto ao redor
        const urlMatch = input.match(/https?:\/\/[^\s]+/) || input.match(/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
        let targetUrl = urlMatch ? urlMatch[0] : input;
        targetUrl = targetUrl.replace(/^["'`(<[]+|[>"'`)\].,;!?*]+$/g, '').trim();

        // Se não tiver protocolo, adiciona https://
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        const isExpand = /^(expandir|desencurtar|unshorten|revelar|ver)\b/i.test(input);
        if (isExpand) {
            try {
                const exp = await shortenerService.expandUrl(targetUrl);
                return reply(F.tela({
                    emoji: '🔍',
                    titulo: 'DESTINO DO LINK',
                    intro: exp.destinationUrl,
                    secoes: [{
                        emoji: '📋', titulo: 'Inspeção de URL',
                        linhas: [
                            F.campo('Destino Real', '`' + exp.destinationUrl + '`'),
                            F.campo('Link Curto', targetUrl),
                            F.campo('Redirecionou', exp.redirected ? 'Sim ↪️' : 'Não (direto)'),
                            F.campo('Status HTTP', String(exp.status))
                        ]
                    }],
                    dica: 'Use para verificar se um link é seguro antes de abrir!',
                    prefix
                }));
            } catch (err) {
                return reply(`❌ Não consegui expandir essa URL: ${err.message}`);
            }
        }

        try {
            const result = await shortenerService.shortenUrl(targetUrl);
            const economia = Math.max(0, targetUrl.length - result.shortUrl.length);

            return reply(F.tela({
                emoji: '🔗',
                titulo: 'LINK ENCURTADO',
                intro: result.shortUrl,
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Puro p/ Copiar', '`' + result.shortUrl + '`'),
                        F.campo('Original', targetUrl.slice(0, 60) + (targetUrl.length > 60 ? '…' : '')),
                        F.campo('Caracteres a menos', String(economia)),
                        F.campo('Serviço', result.provider)
                    ]
                }],
                dica: 'Antes de mandar para alguém, abra o link curto uma vez para conferir que ele leva ao lugar certo.',
                proximos: [{ nome: 'qrcode', args: result.shortUrl, oque: 'gerar um QR Code do link' }],
                prefix
            }));
        } catch (err) {
            logger.warn(`[ENCURTAR] Falha ao encurtar "${targetUrl}": ${err.message}`);
            const invalida = /inválida/i.test(String(err.message));
            return reply(F.tela({
                emoji: '🔗',
                titulo: invalida ? 'Link não aceito' : 'Não consegui encurtar agora',
                intro: invalida
                    ? 'Esse link é inválido ou aponta para uma rede interna, que eu não encurto por segurança.'
                    : 'Os serviços de encurtar link não responderam. Tente de novo em instantes.',
                secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'encurtar', 'https://google.com/search?q=reino')] }],
                prefix
            }));
        }
    }
};
