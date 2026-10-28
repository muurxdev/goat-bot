/**
 * Comando .botclose
 * Controla o fechamento temporário, programado ou imediato do bot
 */

const { scheduleCloseDuration, scheduleCloseAtTime, scheduleCloseIndefinite } = require('../../services/botScheduler');
const { ROLES } = require('../../services/permissionService');
const { gracefulShutdown } = require('../../core/shutdown');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

const pendingConfirmations = new Set();

/** Número legível de quem executou (sem o sufixo do WhatsApp). */
function numeroDe(sender) {
    return sender ? sender.split('@')[0].split(':')[0] : 'administrador';
}

module.exports = {
    name: 'botclose',
    aliases: ['fecharbot', 'closebot'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Me fecha por um tempo, até um horário ou até você reabrir',
    usage: '<30m | 2h | 23:00 [07:00] | indefinite | now>',
    examples: [
        '30m — fecho por 30 minutos e reabro sozinho',
        '23:00 07:00 — fecho às 23h e reabro às 7h',
        'indefinite — fico fechado até você usar .botopen',
        'now — desligo de vez (pede confirmação)'
    ],
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ sender, args, reply, prefix = '.' }) => {
        const senderNum = numeroDe(sender);

        if (!args[0]) {
            return reply(F.tela({
                prefix,
                emoji: '🔒',
                titulo: 'Fechar o atendimento',
                intro: 'Enquanto estou fechado, só os donos e administradores do bot conseguem usar comandos.',
                secoes: [
                    {
                        emoji: '⏱️', titulo: 'Por um tempo', linhas: [
                            `• ${F.cmd(prefix, 'botclose', '30m')} — fecho por 30 minutos e reabro`,
                            `• ${F.cmd(prefix, 'botclose', '2h')} — fecho por 2 horas e reabro`
                        ]
                    },
                    {
                        emoji: '⏰', titulo: 'Em horário marcado', linhas: [
                            `• ${F.cmd(prefix, 'botclose', '23:00 07:00')} — fecho às 23h e reabro às 7h`,
                            `• ${F.cmd(prefix, 'botclose', '23:00')} — fecho às 23h e só reabro manualmente`
                        ]
                    },
                    {
                        emoji: '🛑', titulo: 'Sem prazo', linhas: [
                            `• ${F.cmd(prefix, 'botclose', 'indefinite')} — fico fechado até você reabrir`,
                            `• ${F.cmd(prefix, 'botclose', 'now')} — desligo de vez (pede confirmação)`
                        ]
                    }
                ],
                dica: 'Durações aceitas: s (segundos), m (minutos), h (horas) e d (dias).',
                proximos: [
                    { nome: 'botopen', oque: 'reabrir agora' },
                    { nome: 'botschedule', oque: 'ver o que está programado' },
                    { nome: 'botcancel', oque: 'cancelar o que está programado' }
                ]
            }));
        }

        const arg1 = args[0].toLowerCase();

        // 1. Fechamento Imediato do Processo (.botclose now / .botclose confirm)
        if (arg1 === 'now' || arg1 === 'agora') {
            pendingConfirmations.add(sender);
            return reply(F.tela({
                prefix,
                emoji: '⚠️',
                titulo: 'Confirme o desligamento',
                intro: 'Vou me desligar por completo agora. Só volto quando o servidor me iniciar de novo.',
                dica: 'Se só quer pausar os comandos, use .botclose indefinite em vez de desligar.',
                proximos: [
                    { nome: 'botclose', args: 'confirm', oque: 'confirmar e desligar' },
                    { nome: 'botclose', args: 'indefinite', oque: 'só fechar, sem desligar' }
                ]
            }));
        }

        if (arg1 === 'confirm' || arg1 === 'confirmar') {
            if (!pendingConfirmations.has(sender)) {
                return reply(F.tela({
                    prefix,
                    emoji: 'ℹ️',
                    titulo: 'Nada para confirmar',
                    intro: 'Você não pediu para me desligar agora há pouco.',
                    proximos: [{ nome: 'botclose', args: 'now', oque: 'pedir o desligamento' }]
                }));
            }
            pendingConfirmations.delete(sender);
            await reply('🛑 *Desligando agora*\n\nVou salvar tudo e encerrar com segurança. Até a próxima!');
            logger.info(`[BOT_CLOSE] Encerramento imediato solicitado por ${sender}`);
            setTimeout(() => {
                gracefulShutdown('COMMAND_BOTCLOSE_NOW', 0);
            }, 1000);
            return;
        }

        // 2. Fechamento Indefinido (.botclose indefinite)
        if (arg1 === 'indefinite' || arg1 === 'indefinido') {
            scheduleCloseIndefinite(sender);

            return reply(F.tela({
                prefix,
                emoji: '🔴',
                titulo: 'Estou fechado',
                intro: 'Fico fechado até alguém me reabrir. Só donos e administradores do bot usam comandos agora.',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes', linhas: [
                        F.campo('Prazo', 'sem data para reabrir'),
                        F.campo('Fechado por', `@${senderNum}`)
                    ]
                }],
                proximos: [{ nome: 'botopen', oque: 'reabrir agora' }]
            }), sender ? [sender] : []);
        }

        // 3. Fechamento por Duração (ex: .botclose 30m, 2h, 1d)
        if (arg1.match(/^\d+[smhd]$/i)) {
            try {
                const res = scheduleCloseDuration(arg1, sender);

                return reply(F.tela({
                    prefix,
                    emoji: '🔴',
                    titulo: `Fechado por ${res.durationStr}`,
                    intro: `Reabro sozinho às *${res.reopenAtFormatted}*. Até lá, só donos e administradores do bot usam comandos.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Duração', res.durationStr),
                            F.campo('Reabertura', res.reopenAtFormatted),
                            F.campo('Fechado por', `@${senderNum}`)
                        ]
                    }],
                    proximos: [
                        { nome: 'botopen', oque: 'reabrir antes do prazo' },
                        { nome: 'botschedule', oque: 'ver quanto falta' }
                    ]
                }), sender ? [sender] : []);
            } catch (err) {
                logger.warn(`[BOT_CLOSE] Duração recusada "${arg1}" por ${sender}: ${err.message}`);
                return reply(F.tela({
                    prefix,
                    emoji: '❌',
                    titulo: 'Não entendi essa duração',
                    intro: 'Use um número inteiro maior que zero seguido de s, m, h ou d, com no máximo 365 dias.',
                    proximos: [
                        { nome: 'botclose', args: '30m', oque: 'fechar por 30 minutos' },
                        { nome: 'botclose', args: '2h', oque: 'fechar por 2 horas' }
                    ]
                }));
            }
        }

        // 4. Fechamento por Horário (ex: .botclose 23:00 ou .botclose 23:00 07:00)
        if (arg1.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)) {
            const arg2 = args[1];
            try {
                const res = scheduleCloseAtTime(arg1, arg2, sender);
                const reabre = arg2 ? res.reopenFormatted : 'só quando você reabrir';

                return reply(F.tela({
                    prefix,
                    emoji: '⏰',
                    titulo: `Fechamento marcado para ${res.closeFormatted}`,
                    intro: arg2
                        ? `Fecho às *${res.closeFormatted}* e reabro às *${res.reopenFormatted}*. Até lá, sigo atendendo normalmente.`
                        : `Fecho às *${res.closeFormatted}* e fico fechado até alguém me reabrir.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Fechamento', res.closeFormatted),
                            F.campo('Reabertura', reabre),
                            F.campo('Marcado por', `@${senderNum}`)
                        ]
                    }],
                    proximos: [
                        { nome: 'botschedule', oque: 'ver o que está programado' },
                        { nome: 'botcancel', oque: 'cancelar o horário' }
                    ]
                }), sender ? [sender] : []);
            } catch (err) {
                logger.warn(`[BOT_CLOSE] Horário recusado "${arg1} ${arg2 || ''}" por ${sender}: ${err.message}`);
                return reply(F.tela({
                    prefix,
                    emoji: '❌',
                    titulo: 'Não entendi esse horário',
                    intro: 'Escreva os horários no formato HH:MM, de 00:00 a 23:59.',
                    proximos: [
                        { nome: 'botclose', args: '23:00 07:00', oque: 'fechar às 23h e reabrir às 7h' },
                        { nome: 'botclose', args: '22:30', oque: 'fechar às 22h30' }
                    ]
                }));
            }
        }

        return reply(F.tela({
            prefix,
            emoji: '❌',
            titulo: 'Não entendi o pedido',
            intro: `"${args[0]}" não é uma duração, um horário nem uma das opções do comando.`,
            proximos: [
                { nome: 'botclose', args: '30m', oque: 'fechar por 30 minutos' },
                { nome: 'botclose', args: '23:00 07:00', oque: 'fechar em horário marcado' },
                { nome: 'botclose', oque: 'ver todas as opções' }
            ]
        }));
    }
};
