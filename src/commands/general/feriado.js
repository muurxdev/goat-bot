const logger = require('../../core/logger');

const HOLIDAYS = [
    { name: 'Confraternização Universal', month: 1, day: 1, fixed: true },
    { name: 'Tiradentes', month: 4, day: 21, fixed: true },
    { name: 'Dia do Trabalho', month: 5, day: 1, fixed: true },
    { name: 'Independência do Brasil', month: 9, day: 7, fixed: true },
    { name: 'Nossa Senhora Aparecida', month: 10, day: 12, fixed: true },
    { name: 'Finados', month: 11, day: 2, fixed: true },
    { name: 'Proclamação da República', month: 11, day: 15, fixed: true },
    { name: 'Natal', month: 12, day: 25, fixed: true },
    { name: 'Carnaval (terça-feira)', approximateMonth: 2, approximateDay: 25, fixed: false },
    { name: 'Sexta-feira Santa', approximateMonth: 4, approximateDay: 10, fixed: false },
    { name: 'Corpus Christi', approximateMonth: 6, approximateDay: 5, fixed: false }
];

function getNextHoliday() {
    const now = new Date();
    const currentYear = now.getFullYear();

    const candidates = [];

    for (let year = currentYear; year <= currentYear + 1; year++) {
        for (const h of HOLIDAYS) {
            let m, d;
            if (h.fixed) {
                m = h.month;
                d = h.day;
            } else {
                m = h.approximateMonth;
                d = h.approximateDay;
            }
            const date = new Date(year, m - 1, d);
            if (date >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                candidates.push({ ...h, date, month: m, day: d, year });
            }
        }
    }

    candidates.sort((a, b) => a.date - b.date);
    return candidates[0] || null;
}

module.exports = {
    name: 'feriado',
    aliases: ['proximoferiado', 'feriados', 'holiday'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Mostra o próximo feriado nacional brasileiro',
    cooldownMs: 10000,
    execute: async ({ reply }) => {
        const next = getNextHoliday();
        if (!next) return reply('❌ Não foi possível calcular o próximo feriado.');

        const now = new Date();
        const diff = next.date.getTime() - now.getTime();
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

        const dateStr = next.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

        const doc = [
            `╔══════════════════════════════╗`,
            `║   🇧🇷 *PRÓXIMO FERIADO* 🇧🇷   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `🎉 *${next.name}*`,
            `📅 *Data:* ${dateStr}`,
            `⏳ *Faltam:* ${daysLeft} dia(s)`,
            ``,
            `╭━〔 📋 FERIADOS FIXOS 〕━⬣`,
            `┃ 🎆 01/01 — Confraternização Universal`,
            `┃ 🔥 21/04 — Tiradentes`,
            `┃ 👷 01/05 — Dia do Trabalho`,
            `┃ 🇧🇷 07/09 — Independência do Brasil`,
            `┃ ⛪ 12/10 — Nossa Senhora Aparecida`,
            `┃ 🕯️ 02/11 — Finados`,
            `┃ 🏛️ 15/11 — Proclamação da República`,
            `┃ 🎄 25/12 — Natal`,
            `╰━━━━━━━━━━━━━━━━━━⬣`,
            ``,
            `📌 *Feriados móveis (datas aproximadas):*`,
            `• Carnaval, Sexta-feira Santa e Corpus Christi variam a cada ano.`
        ].join('\n');
        return reply(doc);
    }
};
