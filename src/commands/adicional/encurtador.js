/**
 * Comando .encurtador / .desencurtar / .shorten
 * Encurta URLs longas usando provedores resilientes em cascata
 * ou expande links encurtados revelando o destino final com segurança.
 */

const shortenerService = require('../../services/shortenerService');
const F = require('../../utils/formato');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'encurtador',
    aliases: ["desencurtar","expandir","unshorten","revelarlink","shorten","encurtar","linkcurto","cmd_encurtador","alt_encurtador","atalho_encurtador","abrev_encurtador","call_encurtador","func_encurtador"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Encurta links longos ou expande links encurtados com segurança (.encurtador <link> ou .desencurtar <link>)',
    usage: '<link> ou expandir <link>',
    examples: ['https://exemplo.com/pagina-longa — encurta o link', 'expandir https://bit.ly/xyz — mostra o destino real'],
    cooldownMs: 2500,
    execute: async ({ reply, args, prefix = '.', commandName = 'encurtador' }) => {
        const botName = getBotName();
        let sub = (args[0] || '').toLowerCase().trim();
        let isExpand = ['expandir', 'desencurtar', 'unshorten', 'revelar', 'ver'].includes(sub) ||
                       ['desencurtar', 'expandir', 'unshorten', 'revelarlink'].includes(commandName);

        let targetUrl = isExpand && !/^https?:\/\//i.test(sub) ? (args[1] || '').trim() : (args[0] || '').trim();
        if (!targetUrl) {
            return reply(F.tela({
                emoji: '🔗', titulo: 'Encurtador & Analisador de Links', prefix,
                intro: 'Gerencie e inspecione URLs com total praticidade e segurança.',
                secoes: [
                    { emoji: '⚡', titulo: 'Como Usar', linhas: [
                        `• \`${prefix}encurtador <link-longo>\` ➔ Gera um link curto e seguro`,
                        `• \`${prefix}desencurtar <link-curto>\` ➔ Revela o destino real de um link`
                    ] }
                ],
                dica: 'Suporta TinyURL, is.gd e CleanURI com fallback automático.',
                prefix
            }));
        }

        if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

        // Se o comando chamado foi desencurtar ou subcomando foi expandir
        if (isExpand) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 6000);
                const { buscarComSeguranca } = require('../../services/media/urlSeguro');
                const { resposta: res, destino } = await buscarComSeguranca(targetUrl, {
                    method: 'HEAD',
                    signal: controller.signal
                });
                clearTimeout(timeout);

                const status = res.status;
                const redirecionou = destino !== targetUrl;

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║     🔍 *DESTINO DO LINK* 🔍     ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `📥 *Link Curto:* \`${targetUrl}\`\n`;
                doc += `🌐 *Destino Real:* \`${destino}\`\n`;
                doc += `📡 *Status:* ${status < 400 ? '🟢 Online (' + status + ')' : '🔴 Erro (' + status + ')'}\n`;
                doc += `🔀 *Redirecionamento:* ${redirecionou ? 'Sim (Mascarado)' : 'Direto'}\n\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim());
            } catch (err) {
                if (err.paraUsuario) return reply(`🛡️ ${err.message}`);
                return reply('❌ Não foi possível inspecionar o destino deste link no momento.');
            }
        }

        // Modo Padrão: ENCURTAR URL
        try {
            const res = await shortenerService.shortenUrl(targetUrl);
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║    🔗 *LINK ENCURTADO!* 🔗     ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `🌐 *Link Original:*\n${res.originalUrl}\n\n`;
            doc += `✨ *Link Curto:*\n*${res.shortUrl}*\n\n`;
            doc += `⚡ *Provedor:* ${res.provider}\n`;
            doc += `💡 _Para revelar o destino de qualquer link curto:_ \`${prefix}desencurtar <link>\`\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            return reply(`❌ *Falha ao encurtar o link:* ${err.message || 'Serviço temporariamente indisponível.'}`);
        }
    }
};
