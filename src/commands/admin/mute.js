const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .mute / .mutar / .silenciar
 * Silencia um membro no grupo com tempo determinado e motivo
 */

const muteService = require("../../services/muteService");
const groupAuthService = require("../../services/groupAuthService");
const groupRemovalService = require("../../services/groupRemovalService");
const figurinhaEventoService = require("../../services/figurinhaEventoService");
const audioEventoService = require("../../services/audioEventoService");
const logger = require("../../core/logger");

module.exports = {
    name: "mute",
    aliases: ["silenciar","mutar","calaboca","cmd_mute","alt_mute","atalho_mute","abrev_mute","call_mute","func_mute"],
    category: "admin",
    description: "Silencia um usuário no grupo por tempo determinado",
    usage: "<@pessoa> [tempo] [motivo]",
    examples: ["@fulano — silencia por 15 minutos", "@fulano 1h Desrespeito — por 1 hora, com motivo", "@fulano 0 Motivo grave — até alguém liberar"],
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args = [], mentioned, quotedSender, info, reply, sender, prefix = '.' }) => {
        const ctxInfo = info?.message?.extendedTextMessage?.contextInfo;
        const porMencaoOuResposta = Boolean(mentioned || ctxInfo?.mentionedJid?.[0] || quotedSender || ctxInfo?.participant);
        const alvo = groupRemovalService.extrairAlvo({ info, args, quotedSender, mentioned });

        // A menção também vem nos args ("@5511..."): não é tempo nem motivo.
        // Antes ela caía no motivo e o tempo digitado depois era ignorado.
        const remainingArgs = args.filter(a => !String(a).startsWith('@'));
        if (alvo && !porMencaoOuResposta && !String(args[0] || '').startsWith('@')) remainingArgs.shift();

        if (!alvo) {
            return reply(
                `🔇 *Silenciar alguém*\n\n` +
                `Uso: \`${prefix}mute @pessoa [tempo] [motivo]\`\n\n` +
                `• \`${prefix}mute @pessoa\` — 15 minutos\n` +
                `• \`${prefix}mute @pessoa 10m Spam no chat\`\n` +
                `• \`${prefix}mute @pessoa 1h Desrespeito às regras\`\n` +
                `• \`${prefix}mute @pessoa 0 Motivo grave\` — até alguém liberar\n\n` +
                `Para liberar: \`${prefix}unmute @pessoa\` · Ver quem está sem voz: \`${prefix}mutados\``
            );
        }

        // Em grupo LID, número digitado precisa virar o LID do participante;
        // senão o silêncio fica gravado num JID que nunca manda mensagem.
        let targetJid = alvo;
        try {
            targetJid = await groupAuthService.resolveMemberJid(client, alvo, from) || alvo;
        } catch (err) {
            logger.warn(`[MUTE] Não resolvi ${alvo} em ${from}: ${err.message}`);
        }

        let durationMinutes = '15m';
        let reason = 'Conduta inadequada ou flood';

        if (remainingArgs.length > 0) {
            const possibleDuration = remainingArgs[0].trim();
            if (/^\d+(s|m|h|d)?$/i.test(possibleDuration) || ['inf', 'indefinido', '0'].includes(possibleDuration.toLowerCase())) {
                durationMinutes = possibleDuration;
                remainingArgs.shift();
                if (remainingArgs.length > 0) reason = remainingArgs.join(' ').trim();
            } else {
                reason = remainingArgs.join(' ').trim();
            }
        }

        const targetNum = targetJid.split("@")[0].split(":")[0];
        const senderNum = sender.split("@")[0].split(":")[0];

        try {
            const res = muteService.muteUser({
                groupJid: from,
                userJid: targetJid,
                mutedBy: `${nomeDoMembro(sender)}`,
                durationMinutes,
                reason
            });

            await client.sendMessage(from, {
                text:
                    `🔇 Silenciei @${targetNum} por *${res.durationText}*.\n` +
                    `*Motivo:* ${res.reason}\n\n` +
                    `Enquanto isso, apago as mensagens que chegarem dessa pessoa aqui. Para liberar antes: \`${prefix}unmute @${targetNum}\``,
                mentions: [targetJid, sender]
            });
            await figurinhaEventoService.enviar(client, from, "silencio");
            await audioEventoService.enviar(client, from, "silencio");
        } catch (err) {
            logger.error(`[MUTE] Falha ao silenciar ${targetJid} em ${from}:`, err);
            return reply(`❌ Não consegui silenciar @${targetNum} agora. Tente de novo em instantes.`, [targetJid]);
        }
    }
};
