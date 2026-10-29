const { nomeDoMembro } = require('../../utils/nomeMembro');
const logger = require('../../core/logger');
const persistentScheduler = require('../../services/persistentScheduler');

module.exports = {
    name: 'lembreteme',
    aliases: ["lembrar","remindme","cmd_lembreteme","alt_lembreteme","atalho_lembreteme","abrev_lembreteme","call_lembreteme","func_lembreteme"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Cria lembretes com notificação por menção no tempo especificado (persistente em SQLite)',
    cooldownMs: 3000,
    execute: async ({ reply, args, sender, from, prefix = '.' }) => {
        const tempoRaw = args[0] || '';
        const recado = args.slice(1).join(' ').trim();

        const match = tempoRaw.match(/^(\d+)(s|m|h|d)?$/i);
        if (!match || !recado) {
            return reply(
                `⏰ *Agendador de Lembretes*\n\n` +
                `Use: \`${prefix}lembreteme <tempo> <recado>\`\n\n` +
                `💡 *Exemplos:*\n` +
                `• \`${prefix}lembreteme 15m Beber água\`\n` +
                `• \`${prefix}lembreteme 2h Olhar o forno\`\n` +
                `• \`${prefix}lembreteme 1d Renovar assinatura\``
            );
        }

        const qtd = parseInt(match[1], 10);
        const unidade = (match[2] || 'm').toLowerCase();

        let ms = qtd * 60 * 1000;
        let rotulo = `${qtd} minuto(s)`;
        if (unidade === 's') {
            ms = qtd * 1000;
            rotulo = `${qtd} segundo(s)`;
        } else if (unidade === 'h') {
            ms = qtd * 3600 * 1000;
            rotulo = `${qtd} hora(s)`;
        } else if (unidade === 'd') {
            ms = qtd * 86400 * 1000;
            rotulo = `${qtd} dia(s)`;
        }

        if (ms < 5000) return reply('⚠️ O tempo mínimo de lembrete é de 5 segundos.');
        if (ms > 30 * 86400 * 1000) return reply('⚠️ O tempo máximo de lembrete é de 30 dias.');

        const { timerId, triggerAt } = persistentScheduler.scheduleReminder({
            scopeJid: from,
            senderJid: sender,
            message: recado,
            delayMs: ms,
            label: rotulo
        });

        await reply(
            `⏰ *Lembrete Agendado e Protegido!*\n\n` +
            `📝 *Recado:* _${recado}_\n` +
            `⏳ *Em:* ${rotulo}\n` +
            `📅 *Previsão:* ${persistentScheduler.formatLocalTime(triggerAt)}\n` +
            `👤 *Para:* ${nomeDoMembro(sender)}\n\n` +
            `🔔 *Avisarei você pontualmente (persistido no banco SQLite).*`,
            [sender]
        );
    }
};
