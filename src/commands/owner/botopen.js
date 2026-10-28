/**
 * Comando .botopen
 * Reabre o bot imediatamente ou programa um horário de abertura
 */

const { openImmediately, scheduleReopenAtTime } = require('../../services/botScheduler');
const { ROLES } = require('../../services/permissionService');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

/** Tela de uso para quando o horário digitado não existe (ex: 99:00). */
function telaHorarioInvalido(prefix, digitado) {
    return F.tela({
        prefix,
        emoji: '❌',
        titulo: 'Não entendi esse horário',
        intro: `"${String(digitado).replace(/`/g, "'")}" não é um horário válido. Use HH:MM, de 00:00 a 23:59. Não mudei nada: continuo como estava.`,
        proximos: [
            { nome: 'botopen', args: '07:00', oque: 'marcar a reabertura para as 7h' },
            { nome: 'botopen', oque: 'reabrir agora' }
        ]
    });
}

module.exports = {
    name: 'botopen',
    aliases: ['abrirbot', 'openbot'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Me reabre agora ou marca um horário para eu voltar a atender',
    usage: '[HH:MM]',
    examples: [
        ' — reabro agora e libero os comandos para todos',
        '07:00 — marco a reabertura para as 7h'
    ],
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ sender, args, reply, prefix = '.' }) => {
        const timeArg = args[0];
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : 'administrador';

        // Qualquer argumento é pedido de horário: "99:00" não pode cair na
        // abertura imediata como antes.
        if (timeArg) {
            if (!/^([01]?\d|2[0-3]):([0-5]\d)$/.test(timeArg)) {
                return reply(telaHorarioInvalido(prefix, timeArg));
            }
            try {
                const res = scheduleReopenAtTime(timeArg, sender);

                return reply(F.tela({
                    prefix,
                    emoji: '🟢',
                    titulo: `Reabertura marcada para ${res.reopenFormatted}`,
                    intro: res.fechamentoPendente
                        ? `Mantenho o fechamento das *${res.closeFormatted}* e volto a atender todo mundo às *${res.reopenFormatted}*.`
                        : `Volto a atender todo mundo às *${res.reopenFormatted}*.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            res.fechamentoPendente ? F.campo('Fechamento', res.closeFormatted) : null,
                            F.campo('Reabertura', res.reopenFormatted),
                            F.campo('Marcado por', `@${senderNum}`)
                        ]
                    }],
                    proximos: [
                        { nome: 'botopen', oque: 'reabrir agora em vez de esperar' },
                        { nome: 'botschedule', oque: 'ver o que está programado' }
                    ]
                }), sender ? [sender] : []);
            } catch (err) {
                if (err.code === 'JA_ABERTO') {
                    return reply(F.tela({
                        prefix,
                        emoji: 'ℹ️',
                        titulo: 'Já estou aberto',
                        intro: 'Estou atendendo normalmente e não tenho fechamento marcado, então não há reabertura para marcar.',
                        proximos: [
                            { nome: 'botclose', args: `23:00 ${timeArg}`, oque: `fechar às 23h e reabrir às ${timeArg}` },
                            { nome: 'botschedule', oque: 'ver o que está programado' }
                        ]
                    }));
                }
                logger.warn(`[BOT_OPEN] Horário recusado "${timeArg}" por ${sender}: ${err.message}`);
                return reply(telaHorarioInvalido(prefix, timeArg));
            }
        }

        // Abertura imediata
        openImmediately(sender);

        return reply(F.tela({
            prefix,
            emoji: '🟢',
            titulo: 'Estou aberto',
            intro: 'Voltei a atender: todos podem usar os comandos de novo. Horários de fechamento que estavam marcados foram cancelados.',
            secoes: [{
                emoji: '📋', titulo: 'Detalhes', linhas: [
                    F.campo('Comandos', 'liberados para todos'),
                    F.campo('Reaberto por', `@${senderNum}`)
                ]
            }],
            proximos: [
                { nome: 'botclose', args: '30m', oque: 'fechar por 30 minutos' },
                { nome: 'botschedule', oque: 'conferir a situação' }
            ]
        }), sender ? [sender] : []);
    }
};
