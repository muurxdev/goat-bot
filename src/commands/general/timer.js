const logger = require('../../core/logger');
const persistentScheduler = require('../../services/persistentScheduler');

module.exports = {
    name: 'timer',
    aliases: ['countdowntimer', 'temporizador2'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Inicia um timer regressivo persistente no SQLite que avisa ao terminar',
    cooldownMs: 3000,
    execute: async ({ args, text, reply, sender, from, client, prefix = '.' }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                `❌ Uso: \`${prefix}timer <tempo> [motivo]\`\n\n` +
                '📌 *Formatos de tempo:*\n' +
                '• `30s` — 30 segundos\n' +
                '• `5m` — 5 minutos\n' +
                '• `2h` — 2 horas\n\n' +
                `📌 *Exemplo:* \`${prefix}timer 5m Pizza no forno\``
            );
        }

        const match = input.match(/^(\d+)\s*(s|m|h)(?:\s+(.+))?$/i);
        if (!match) return reply(`❌ Formato inválido. Use \`${prefix}timer <tempo> [motivo]\` (ex: \`${prefix}timer 5m Pausa\`).`);

        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        const motivo = match[3]?.trim() || 'Tempo esgotado!';

        if (amount <= 0) return reply('❌ O tempo deve ser maior que zero.');

        let ms;
        let label;
        switch (unit) {
            case 's': ms = amount * 1000; label = `${amount} segundo(s)`; break;
            case 'm': ms = amount * 60 * 1000; label = `${amount} minuto(s)`; break;
            case 'h': ms = amount * 60 * 60 * 1000; label = `${amount} hora(s)`; break;
            default: return reply('❌ Unidade inválida. Use `s`, `m` ou `h`.');
        }

        if (ms < 5000) return reply('⚠️ O tempo mínimo do timer é de 5 segundos.');
        if (ms > 24 * 60 * 60 * 1000) return reply('⚠️ O tempo máximo é de 24 horas.');

        const { timerId, triggerAt } = persistentScheduler.scheduleTimer({
            scopeJid: from,
            senderJid: sender,
            message: motivo,
            delayMs: ms,
            label
        });

        return reply(
            `⏱️ *Timer Regressivo Ativado!*\n\n` +
            `⏳ *Duração:* ${label}\n` +
            `🎯 *Motivo:* _${motivo}_\n` +
            `📅 *Alarme previsto para:* ${persistentScheduler.formatLocalTime(triggerAt)}\n` +
            `🆔 *ID:* \`${timerId}\`\n\n` +
            `🔔 _(Salvo no banco SQLite: tocará mesmo se o bot reiniciar)_`
        );
    }
};
