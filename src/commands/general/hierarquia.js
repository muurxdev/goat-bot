/**
 * Comando .hierarquia / .cargos
 * Exibe a divisão estrutural de níveis e estilos de usuários no bot:
 * Dono Master, Sub-Dono, Dono de Aluguel (Locatário), Administrador de Grupo, VIP/Parceiro e Membro.
 */

const { ROLES, ROLE_LABELS, resolveUserRole } = require('../../services/permissionService');
const { getBotName } = require('../../config/botConfig');
const rentalService = require('../../services/rentalService');
const M = require('../../utils/moldura');
const F = require('../../utils/formato');

module.exports = {
    name: 'hierarquia',
    aliases: ['cargos', 'niveis', 'permissoes', 'roles', 'estilos', 'hierarquias'],
    category: 'general',
    subcategory: 'Central de Ajuda',
    description: 'Exibe as hierarquias divisórias, níveis de permissão e privilégios de cada estilo de usuário',
    usage: '',
    cooldownMs: 2000,
    execute: async ({ reply, client, from, info, isGroup, sender, isAdmin, isOwner, userRole, prefix = '.' }) => {
        const botName = getBotName();
        const role = userRole || resolveUserRole(sender, isAdmin, isOwner, { from, isGroup });
        const cleanSender = sender ? sender.split('@')[0].split(':')[0] : 'Usuário';

        // 1. Identificação do Cargo Atual do Usuário
        let cargoAtual = ROLE_LABELS[role.level] || 'Membro';
        let emojiCargo = '👤';
        if (role.level >= ROLES.OWNER) emojiCargo = '👑';
        else if (role.level >= ROLES.BOT_ADMIN) emojiCargo = '⭐';
        else if (role.level >= ROLES.RENTAL_OWNER) emojiCargo = '💼';
        else if (role.level >= ROLES.GROUP_ADMIN) emojiCargo = '🛡️';
        else if (role.level >= ROLES.TRUSTED) emojiCargo = '🤝';

        // 2. Detalhes de Aluguel (se for locatário ou se o grupo tiver aluguel)
        let rentalSnippet = '';
        if (role.level === ROLES.RENTAL_OWNER || role.isRentalOwner) {
            const rentalInfo = rentalService.getRentalInfo(from) || rentalService.getRentalInfo(sender);
            if (rentalInfo) {
                rentalSnippet = `\n┃ ⏳ *Tempo Restante:* ${rentalInfo.remainingText}\n┃ 📅 *Vencimento:* ${rentalInfo.expiresAtFormatted}`;
            }
        }

        // 3. Montagem da Estrutura Visual
        const secoes = [
            {
                emoji: '👑',
                titulo: 'Nível 5 — Dono Master (Capitão)',
                linhas: [
                    '┃ • *Acesso:* Total e absoluto no bot, VPS e banco de dados.',
                    '┃ • *Poderes:* .eval, .shutdown, .restart, .bancmd, nomear donos e conceder planos vitalícios.'
                ]
            },
            {
                emoji: '⭐',
                titulo: 'Nível 4 — Sub-Dono / Co-Dono (Bot Admin)',
                linhas: [
                    '┃ • *Acesso:* Gestão global do bot e suporte técnico avançado.',
                    '┃ • *Poderes:* Bans globais, travas globais de módulos/comandos e gestão de confiança.'
                ]
            },
            {
                emoji: '💼',
                titulo: 'Nível 3.5 — Dono de Aluguel (Locatário Ativo)',
                linhas: [
                    '┃ • *Acesso:* Usuário que contratou o bot para o grupo ou privado.',
                    '┃ • *Poderes por Tempo Determinado:* Manda na configuração do bot naquele escopo:',
                    '┃   ➤ `.cmd on/off` — liga e desliga comandos no grupo',
                    '┃   ➤ `.modulo on/off` — gerencia módulos e ecossistemas',
                    '┃   ➤ `.categoria on/off` — ativa e desativa categorias',
                    '┃   ➤ `.config` / `.bemvindo` / `.adeus` — mensagens personalizadas',
                    '┃   ➤ `.abertura` / `.fechamento` — horários do grupo',
                    '┃ • *Validade:* Expira e perde os poderes junto com o término do plano.'
                ]
            },
            {
                emoji: '🛡️',
                titulo: 'Nível 3 — Administrador do Grupo (ADM)',
                linhas: [
                    '┃ • *Acesso:* Moderação nativa do grupo WhatsApp.',
                    '┃ • *Poderes:* Ban local, expulsão, advertências (.warn), mutar, abrir/fechar grupo e marcar todos (.hidetag).'
                ]
            },
            {
                emoji: '🤝',
                titulo: 'Nível 2 — VIP / Confiável / Parceiro (Trusted)',
                linhas: [
                    '┃ • *Acesso:* Acesso com benefícios e prioridade.',
                    '┃ • *Poderes:* Isenção de spam/rate-limit, limites ampliados em economia/cassino e permissão para envio de links de parceiros.'
                ]
            },
            {
                emoji: '👤',
                titulo: 'Nível 1 — Membro da Comunidade (User)',
                linhas: [
                    '┃ • *Acesso:* Todos os comandos públicos da comunidade.',
                    '┃ • *Poderes:* RPG, Economia, Apostas, IA, Mídia, Figurinhas, Quizzes, Futebol e Diversão.'
                ]
            }
        ];

        let doc = `${M.cabecalho('🏛️', `Hierarquia do Sistema — ${botName}`)}\n\n`;
        doc += `╭━〔 👤 SUA IDENTIDADE NO BOT 〕━⬣\n`;
        doc += `┃ 📱 *Usuário:* @${cleanSender}\n`;
        doc += `┃ ${emojiCargo} *Cargo Atual:* *${cargoAtual}* (Nível ${role.level})\n`;
        if (rentalSnippet) doc += `${rentalSnippet}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`;

        for (const sec of secoes) {
            doc += `${M.abreSecao(sec.emoji, sec.title || sec.titulo)}\n`;
            for (const linha of sec.linhas) {
                doc += `${linha}\n`;
            }
            doc += `${M.FECHA}\n\n`;
        }

        doc += `🧭 *Comandos Úteis de Orientação:*\n`;
        doc += `• \`${prefix}meualuguel\` — Ver status e tempo da locação deste grupo/PV\n`;
        doc += `• \`${prefix}aluguel planos\` — Ver tabela de planos e valores para contratar\n`;
        doc += `• \`${prefix}menu\` — Ver todas as áreas e categorias disponíveis\n`;
        doc += `• \`${prefix}dono\` — Falar com os donos oficiais do bot`;

        if (process.env.NODE_ENV === 'test' || !client) {
            return reply(doc.trim(), [sender]);
        }

        const { sendMenuMediaMessage } = require('../../utils/wallpapers');
        return await sendMenuMediaMessage(client, from, {
            category: 'aluguel',
            text: doc.trim(),
            quoted: info,
            mentions: [sender],
            page: 1
        });
    }
};
