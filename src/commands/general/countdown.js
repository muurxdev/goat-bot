const logger = require('../../core/logger');

module.exports = {
    name: 'countdown',
    aliases: ['contagem', 'countd', 'faltam'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Mostra a contagem regressiva para uma data específica',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply('❌ Informe uma data no formato *DD/MM/AAAA*.\n\n📌 *Exemplo:* `.countdown 25/12/2026`');
        }

        const match = input.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
        if (!match) return reply('❌ Formato inválido. Use *DD/MM/AAAA*.');

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        const target = new Date(year, month - 1, day);
        if (target.getDate() !== day || target.getMonth() !== month - 1) {
            return reply('❌ Data inválida.');
        }

        const now = new Date();
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) return reply('⏰ Essa data já passou!');

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const doc = [
            `╔══════════════════════════════╗`,
            `║   ⏳ *COUNTDOWN* ⏳   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `📅 *Data alvo:* ${day}/${month}/${year}`,
            ``,
            `╭━〔 ⏰ TEMPO RESTANTE 〕━⬣`,
            `┃ 🗓️ *${days}* dias`,
            `┃ 🕐 *${hours}* horas`,
            `┃ ⏱️ *${minutes}* minutos`,
            `┃ ⏲️ *${seconds}* segundos`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
