/**
 * Comando .reputacaoreino / .reputacao / .reputar / .rankreputacao
 * Sistema Oficial de Reputação, Confiança e Negociações Seguras da Comunidade
 */

const userRepo = require('../../database/repositories/userRepository');
const M = require('../../utils/moldura');
const F = require('../../utils/formato');
const logger = require('../../core/logger');

function parseTargetJid(context) {
    const { mentionedJid, quotedSender, args, sender } = context;
    if (mentionedJid && mentionedJid.length > 0) return mentionedJid[0];
    if (quotedSender) return quotedSender;
    if (args && args.length > 0) {
        const raw = args.find(a => /^\+?\d{8,15}$/.test(String(a).replace(/\D/g, '')));
        if (raw) return String(raw).replace(/\D/g, '') + '@s.whatsapp.net';
    }
    return sender;
}

module.exports = {
    name: 'reputacaoreino',
    aliases: ["rankreputacao","reputacao","reputar","reputacaoreino-cmd","cmd-reputacaoreino"],
    category: 'profile',
    subcategory: 'Perfil, XP & Ranking',
    description: 'Sistema de reputação, avaliações de trocas/vendas e selos de confiança',
    cooldownMs: 2000,
    execute: async (context) => {
        const { reply, sender, args = [], prefix = '.' } = context;
        const sub = (args[0] || '').toLowerCase().trim();

        // 1. Subcomando de Avaliação Positiva / Negativa (.reputacao avaliar @user +1 motivo)
        if (sub === 'avaliar' || sub === 'positivo' || sub === '+1' || sub === 'alertar' || sub === 'negativo' || sub === '-1') {
            const isPositive = sub === 'avaliar' || sub === 'positivo' || sub === '+1';
            let targetJid = context.mentionedJid?.[0] || context.quotedSender;

            if (!targetJid && args[1]) {
                const cleanNum = args[1].replace(/\D/g, '');
                if (cleanNum.length >= 8) targetJid = `${cleanNum}@s.whatsapp.net`;
            }

            if (!targetJid || targetJid === sender) {
                return reply(
                    `❌ *Como avaliar outro membro:*\n` +
                    `• \`${prefix}reputacao positivo @user <motivo da negociação>\`\n` +
                    `• \`${prefix}reputacao alertar @user <motivo do alerta>\`\n\n` +
                    `_Você não pode avaliar a si mesmo._`
                );
            }

            const motivo = args.slice(2).join(' ').trim() || (isPositive ? 'Negociação bem sucedida' : 'Transação suspeita / irregular');
            const targetUser = userRepo.getUser(targetJid) || { jid: targetJid };

            targetUser.rep = (targetUser.rep || 0) + (isPositive ? 1 : -1);
            if (!targetUser.tradeReviews) targetUser.tradeReviews = [];

            targetUser.tradeReviews.unshift({
                from: sender.split('@')[0],
                positive: isPositive,
                motivo: motivo.slice(0, 100),
                data: new Date().toLocaleDateString('pt-BR')
            });

            if (targetUser.tradeReviews.length > 10) {
                targetUser.tradeReviews = targetUser.tradeReviews.slice(0, 10);
            }

            userRepo.saveUser(targetUser);

            const emojiBadge = isPositive ? '⭐' : '⚠️';
            const actionText = isPositive ? 'AVALIAÇÃO POSITIVA REGISTRADA!' : 'ALERTA DE TRANSAÇÃO REGISTRADO!';
            const cleanTarget = targetJid.split('@')[0];

            return reply(
                `${emojiBadge} *[${actionText}]*\n\n` +
                `👤 *Membro avaliado:* @${cleanTarget}\n` +
                `📝 *Motivo:* ${motivo}\n` +
                `🏆 *Nova pontuação:* ${targetUser.rep} pontos de reputação.\n\n` +
                `_O histórico fica registrado no perfil do membro com \`${prefix}reputacao @${cleanTarget}\`._`,
                [targetJid]
            );
        }

        // 2. Consulta de Reputação (.reputacao ou .reputacao @user)
        const targetJid = parseTargetJid(context);
        const cleanTarget = targetJid.split('@')[0];
        const user = userRepo.getUser(targetJid) || { jid: targetJid, rep: 0 };
        const repScore = user.rep || 0;

        // Selo de Confiabilidade
        let selo = '🥉 Membro Comum';
        let seloEmoji = '🔹';
        if (repScore >= 30) {
            selo = '💎 Comerciante Lendário // 100% Confiável';
            seloEmoji = '🛡️';
        } else if (repScore >= 15) {
            selo = '🥇 Vendedor Verificado';
            seloEmoji = '✅';
        } else if (repScore >= 5) {
            selo = '🥈 Membro Recomendado';
            seloEmoji = '⭐';
        } else if (repScore < 0) {
            selo = '🚨 Sob Alerta Comunitário';
            seloEmoji = '⚠️';
        }

        const reviews = Array.isArray(user.tradeReviews) ? user.tradeReviews : [];
        const positivas = reviews.filter(r => r.positive).length;
        const negativas = reviews.filter(r => !r.positive).length;

        const linhasFicha = [
            `• *Membro:* @${cleanTarget}`,
            `• *Selo de Confiabilidade:* ${seloEmoji} ${selo}`,
            `• *Pontuação Total:* ⭐ *${repScore}* pontos`,
            `• *Histórico:* 🟢 *${positivas}* positivas · 🔴 *${negativas}* alertas`
        ];

        if (reviews.length > 0) {
            linhasFicha.push('\n📜 *Últimos Registros da Comunidade:*');
            reviews.slice(0, 3).forEach((r, i) => {
                const icone = r.positive ? '🟢' : '🔴';
                linhasFicha.push(`  ${icone} *${r.data}* (@${r.from}): "${r.motivo}"`);
            });
        }

        const blocos = [
            M.cabecalho('🛡️', `FICHA DE REPUTAÇÃO & CONFIANÇA`),
            M.secao('📊', 'Informações de Negociação', linhasFicha),
            `💡 _Para avaliar alguém após uma compra, venda ou troca: \`${prefix}reputacao positivo @user <motivo>\`._`,
            M.assinatura()
        ];

        return reply(blocos.join('\n\n'), [targetJid]);
    }
};
