const logger = require('../../core/logger');

const SIGNS = [
    { name: 'Áries', element: 'Fogo', emoji: '♈', start: [3, 21], end: [4, 19], traits: 'Corajoso, enérgico, impulsivo, líder nato, apaixonado por novos desafios.' },
    { name: 'Touro', element: 'Terra', emoji: '♉', start: [4, 20], end: [5, 20], traits: 'Prático, determinado, leal, sensual, valoriza segurança e conforto.' },
    { name: 'Gêmeos', element: 'Ar', emoji: '♊', start: [5, 21], end: [6, 20], traits: 'Comunicativo, curioso, versátil, sociável, adora variedade e aprendizado.' },
    { name: 'Câncer', element: 'Água', emoji: '♋', start: [6, 21], end: [7, 22], traits: 'Protetor, emocional, intuitivo, lar é sagrado, forte instinto familiar.' },
    { name: 'Leão', element: 'Fogo', emoji: '♌', start: [7, 23], end: [8, 22], traits: 'Carismático, generoso, dramático, orgulhoso, brilha em qualquer ambiente.' },
    { name: 'Virgem', element: 'Terra', emoji: '♍', start: [8, 23], end: [9, 22], traits: 'Perfeccionista, analítico, trabalhador, reservado, atento aos detalhes.' },
    { name: 'Libra', element: 'Ar', emoji: '♎', start: [9, 23], end: [10, 22], traits: 'Diplomático, charmoso, indeciso, justo, busca harmonia em tudo.' },
    { name: 'Escorpião', element: 'Água', emoji: '♏', start: [10, 23], end: [11, 21], traits: 'Intenso, misterioso, apaixonado, vingativo, penetrante em suas análises.' },
    { name: 'Sagitário', element: 'Fogo', emoji: '♐', start: [11, 22], end: [12, 21], traits: 'Aventureiro, otimista, filosófico, livre, adora viajar e explorar.' },
    { name: 'Capricórnio', element: 'Terra', emoji: '♑', start: [12, 22], end: [1, 19], traits: 'Ambicioso, disciplinado, reservado, responsável, focado em conquistas.' },
    { name: 'Aquário', element: 'Ar', emoji: '♒', start: [1, 20], end: [2, 18], traits: 'Inovador, humanitário, excêntrico, independente, pensador progressista.' },
    { name: 'Peixes', element: 'Água', emoji: '♓', start: [2, 19], end: [3, 20], traits: 'Sensível, sonhador, compassivo, intuitivo, profundamente emotivo.' }
];

function getSign(day, month) {
    for (const sign of SIGNS) {
        const [sm, sd] = sign.start;
        const [em, ed] = sign.end;
        if (sm <= em) {
            if ((month === sm && day >= sd) || (month === em && day <= ed) || (month > sm && month < em)) return sign;
        } else {
            if ((month === sm && day >= sd) || (month === em && day <= ed) || month > sm || month < em) return sign;
        }
    }
    return SIGNS[SIGNS.length - 1];
}

module.exports = {
    name: 'signo',
    aliases: ['zodiaco', 'horoscopo', 'signos'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Consulta o signo do zodíaco baseado na data de nascimento',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply('❌ Informe uma data no formato *DD/MM*.\n\n📌 *Exemplo:* `.signo 15/03`');
        }

        const match = input.match(/(\d{1,2})[\/\-.](\d{1,2})/);
        if (!match) return reply('❌ Formato inválido. Use *DD/MM* (ex: `.signo 15/03`).');

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        if (day < 1 || day > 31 || month < 1 || month > 12) return reply('❌ Data inválida.');

        const sign = getSign(day, month);
        const doc = [
            `╔══════════════════════════════╗`,
            `║   ${sign.emoji} *SIGNO DO ZODÍACO* ${sign.emoji}   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `astrologia *${sign.name}* ${sign.emoji}`,
            `🜂 *Elemento:* ${sign.element}`,
            `📅 *Período:* ${sign.start[1]}/${sign.start[0]} a ${sign.end[1]}/${sign.end[0]}`,
            ``,
            `╭━〔 🧬 TRAÇOS DE PERSONALIDADE 〕━⬣`,
            `┃ ${sign.traits}`,
            `╰━━━━━━━━━━━━━━━━━━⬣`,
            ``,
            `📅 *Data consultada:* ${day}/${month}`
        ].join('\n');
        return reply(doc);
    }
};
