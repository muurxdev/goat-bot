const logger = require('../../core/logger');
const persistentScheduler = require('../../services/persistentScheduler');

module.exports = {
    name: 'temporizador',
    aliases: ["cronometro","despertador","cmd_temporizador","alt_temporizador","atalho_temporizador","abrev_temporizador","call_temporizador","func_temporizador"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Inicia um alarme/temporizador de contagem regressiva no chat (persistente no SQLite)',
    cooldownMs: 3000,
    execute: async ({ reply, args, sender, from, prefix = '.' }) => {
        const timeInput = args[0] || '';
        const motivo = args.slice(1).join(' ') || 'Tempo esgotado!';

        const match = timeInput.match(/^(\d+)(s|m|h)?$/i);
        if (!match) {
            return reply(
                `⏱️ *Uso do Temporizador:*\n\`${prefix}temporizador <tempo> [motivo]\`\n\n` +
                `💡 *Exemplos:*\n` +
                `• \`${prefix}temporizador 30s\` (30 segundos)\n` +
                `• \`${prefix}temporizador 5m Pausa do café\` (5 minutos)\n` +
                `• \`${prefix}temporizador 1h Almoço\` (1 hora)`
            );
        }

        const valor = parseInt(match[1], 10);
        const unidade = (match[2] || 's').toLowerCase();

        let segundos = valor;
        if (unidade === 'm') segundos = valor * 60;
        if (unidade === 'h') segundos = valor * 3600;

        if (segundos < 5) return reply('⚠️ O tempo mínimo do temporizador é de 5 segundos.');
        if (segundos > 7200) return reply('⚠️ O tempo máximo do temporizador é de 2 horas (7200s).');

        const tempoFormatado = segundos >= 3600 
            ? `${Math.floor(segundos/3600)}h ${Math.floor((segundos%3600)/60)}m` 
            : (segundos >= 60 ? `${Math.floor(segundos/60)}m ${segundos%60}s` : `${segundos}s`);

        const { timerId, triggerAt } = persistentScheduler.scheduleTimer({
            scopeJid: from,
            senderJid: sender,
            message: motivo,
            delayMs: segundos * 1000,
            label: tempoFormatado
        });

        await reply(
            `⏱️ *Temporizador Ativado com Sucesso!*\n\n` +
            `⏳ Duração: *${tempoFormatado}*\n` +
            `🎯 Motivo: _${motivo}_\n` +
            `📅 Fim Previsto: ${persistentScheduler.formatLocalTime(triggerAt)}\n` +
            `👤 Para: @${sender.split('@')[0]}\n\n` +
            `🔔 *Avisarei você quando o tempo acabar (persistido no banco SQLite)!* `,
            [sender]
        );
    }
};
