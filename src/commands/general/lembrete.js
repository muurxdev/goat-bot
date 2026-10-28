const logger = require('../../core/logger');
const persistentScheduler = require('../../services/persistentScheduler');

module.exports = {
    name: 'lembrete',
    aliases: ['reminder', 'alerta', 'lembretes'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Cria um lembrete persistente no SQLite para ser disparado após um tempo',
    cooldownMs: 3000,
    execute: async ({ args, text, reply, sender, from, client, prefix = '.' }) => {
        const input = (text || '').trim();

        // Se digitou apenas .lembrete ou .lembretes lista os ativos
        if (input.toLowerCase() === 'listar' || input.toLowerCase() === 'list') {
            const timers = persistentScheduler.listUserTimers(sender, from);
            if (!timers || timers.length === 0) {
                return reply('📭 Você não possui nenhum lembrete ativo no momento.');
            }

            let msg = '📋 *Seus Lembretes Ativos:*\n\n';
            for (let i = 0; i < timers.length; i++) {
                const t = timers[i];
                msg += `${i + 1}. 📝 _"${t.content}"_\n   📅 Dispara em: ${persistentScheduler.formatLocalTime(t.triggerAt)}\n   🆔 \`${t.id}\`\n\n`;
            }
            msg += `💡 Para cancelar, use: \`${prefix}lembrete cancelar <ID>\``;
            return reply(msg.trim());
        }

        if (input.toLowerCase().startsWith('cancelar ') || input.toLowerCase().startsWith('del ')) {
            const idToCancel = input.split(' ')[1]?.trim();
            if (!idToCancel) return reply('❌ Informe o ID do lembrete a cancelar.');
            const ok = persistentScheduler.cancel(idToCancel, sender);
            if (ok) return reply(`✅ Lembrete \`${idToCancel}\` cancelado com sucesso.`);
            return reply('❌ Lembrete não encontrado ou já executado.');
        }

        if (!input) {
            return reply(
                '⏰ *Como Agendar um Lembrete:*\n\n' +
                `• \`${prefix}lembrete <tempo> <mensagem>\` — agenda um lembrete\n` +
                `• \`${prefix}lembrete listar\` — vê seus lembretes ativos\n` +
                `• \`${prefix}lembrete cancelar <id>\` — cancela um lembrete\n\n` +
                '📌 *Formatos de tempo suportados:*\n' +
                '• `10m` — 10 minutos\n' +
                '• `2h` — 2 horas\n' +
                '• `1d` — 1 dia\n' +
                '• `30s` — 30 segundos\n\n' +
                '📌 *Exemplo:* `.lembrete 30m Reunião com a guilda`'
            );
        }

        const match = input.match(/^(\d+)\s*(s|m|h|d)\s+(.+)/i);
        if (!match) {
            return reply(`❌ Formato inválido. Use: \`${prefix}lembrete <tempo> <mensagem>\` (ex: \`${prefix}lembrete 30m Reunião\`).`);
        }

        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        const message = match[3].trim();

        if (amount <= 0) return reply('❌ O tempo deve ser maior que zero.');

        let ms;
        let unitLabel;
        switch (unit) {
            case 's': ms = amount * 1000; unitLabel = 'segundo(s)'; break;
            case 'm': ms = amount * 60 * 1000; unitLabel = 'minuto(s)'; break;
            case 'h': ms = amount * 60 * 60 * 1000; unitLabel = 'hora(s)'; break;
            case 'd': ms = amount * 24 * 60 * 60 * 1000; unitLabel = 'dia(s)'; break;
            default: return reply('❌ Unidade inválida. Use `s`, `m`, `h` ou `d`.');
        }

        if (ms < 5000) return reply('⚠️ O tempo mínimo é de 5 segundos.');
        if (ms > 30 * 24 * 60 * 60 * 1000) return reply('⚠️ O tempo máximo para agendamento é de 30 dias.');

        const { timerId, triggerAt } = persistentScheduler.scheduleReminder({
            scopeJid: from,
            senderJid: sender,
            message,
            delayMs: ms,
            label: `${amount} ${unitLabel}`
        });

        return reply(
            `✅ *Lembrete agendado e salvo com sucesso!*\n\n` +
            `📝 *Mensagem:* _${message}_\n` +
            `⏳ *Dispara em:* ${amount} ${unitLabel}\n` +
            `📅 *Horário Previsto:* ${persistentScheduler.formatLocalTime(triggerAt)}\n` +
            `🆔 *ID:* \`${timerId}\`\n\n` +
            `🔒 _(Salvo no banco SQLite: não será perdido mesmo se o bot reiniciar)_`
        );
    }
};
