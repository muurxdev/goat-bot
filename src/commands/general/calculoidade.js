const logger = require('../../core/logger');

module.exports = {
    name: 'calculoidade',
    aliases: ['idade', 'calcid'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula a idade exata em anos, meses e dias',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply('❌ Informe sua data de nascimento no formato *DD/MM/AAAA*.\n\n📌 *Exemplo:* `.calculoidade 15/03/1990`');
        }

        const match = input.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
        if (!match) return reply('❌ Formato inválido. Use *DD/MM/AAAA*.');

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        const birth = new Date(year, month - 1, day);
        if (birth.getDate() !== day || birth.getMonth() !== month - 1) {
            return reply('❌ Data de nascimento inválida.');
        }

        const today = new Date();
        if (birth > today) return reply('❌ A data de nascimento não pode ser no futuro.');

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));

        const doc = [
            `╔══════════════════════════════╗`,
            `║   🎂 *CÁLCULO DE IDADE* 🎂   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `📅 *Nascimento:* ${day}/${month}/${year}`,
            ``,
            `╭━〔 🎉 IDADE EXATA 〕━⬣`,
            `┃ 🗓️ *${years}* anos, *${months}* meses e *${days}* dias`,
            `┃ 📊 *Total de dias vividos:* ${totalDays.toLocaleString('pt-BR')}`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
