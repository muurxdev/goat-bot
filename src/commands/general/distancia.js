const logger = require('../../core/logger');

const DISTANCES = {
    'São Paulo|Rio de Janeiro': 430,
    'São Paulo|Belo Horizonte': 586,
    'São Paulo|Brasília': 1015,
    'São Paulo|Salvador': 1962,
    'São Paulo|Curitiba': 408,
    'São Paulo|Porto Alegre': 1109,
    'São Paulo|Recife': 2660,
    'São Paulo|Fortaleza': 3162,
    'São Paulo|Manaus': 3870,
    'São Paulo|Belém': 2935,
    'São Paulo|Goiânia': 926,
    'São Paulo|Vitória': 1217,
    'São Paulo|Florianópolis': 705,
    'São Paulo|Natal': 2957,
    'São Paulo|João Pessoa': 2877,
    'São Paulo|Aracaju': 2179,
    'São Paulo|Campo Grande': 1014,
    'São Paulo|Cuiabá': 1575,
    'São Paulo|Palmas': 1760,
    'Rio de Janeiro|Belo Horizonte': 440,
    'Rio de Janeiro|Brasília': 1154,
    'Rio de Janeiro|Salvador': 1650,
    'Rio de Janeiro|Curitiba': 852,
    'Rio de Janeiro|Recife': 2560,
    'Rio de Janeiro|Fortaleza': 3070,
    'Rio de Janeiro|Porto Alegre': 1540,
    'Rio de Janeiro|Goiânia': 1070,
    'Belo Horizonte|Brasília': 720,
    'Belo Horizonte|Salvador': 1370,
    'Belo Horizonte|Vitória': 530,
    'Brasília|Goiânia': 175,
    'Brasília|Salvador': 1440,
    'Brasília|Manaus': 3115,
    'Brasília|Belém': 2210,
    'Brasília|Curitiba': 1510,
    'Brasília|Recife': 2100,
    'Brasília|Fortaleza': 2200,
    'Brasília|Porto Alegre': 1870,
    'Curitiba|Porto Alegre': 710,
    'Curitiba|Florianópolis': 300,
    'Curitiba|Belo Horizonte': 1030,
    'Salvador|Recife': 650,
    'Salvador|Fortaleza': 1340,
    'Salvador|Aracaju': 330,
    'Fortaleza|Recife': 630,
    'Fortaleza|Natal': 530,
    'Recife|Natal': 155,
    'Recife|João Pessoa': 120,
    'Natal|João Pessoa': 150,
    'Manaus|Belém': 1320,
    'Porto Alegre|Florianópolis': 480,
    'Porto Alegre|Curitiba': 710
};

function normalize(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z\s]/g, '')
        .trim();
}

function findCity(input) {
    const norm = normalize(input);
    const cities = new Set();
    for (const key of Object.keys(DISTANCES)) {
        const [a, b] = key.split('|');
        cities.add(a);
        cities.add(b);
    }
    for (const city of cities) {
        if (normalize(city) === norm) return city;
    }
    for (const city of cities) {
        if (normalize(city).includes(norm) || norm.includes(normalize(city))) return city;
    }
    return null;
}

module.exports = {
    name: 'distancia',
    aliases: ['dist', 'distanciacid', 'km'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula a distância rodoviária entre cidades brasileiras',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.distancia <cidade1> <cidade2>`\n\n' +
                '📌 *Exemplo:* `.distancia São Paulo Rio de Janeiro`\n\n' +
                '🏙️ *Cidades disponíveis:* São Paulo, Rio de Janeiro, Belo Horizonte, Brasília, Salvador, Curitiba, Porto Alegre, Recife, Fortaleza, Manaus, Belém, Goiânia, Vitória, Florianópolis, Natal, João Pessoa, Aracaju, Campo Grande, Cuiabá, Palmas'
            );
        }

        const separators = [' e ', ' para ', '-', ' – ', '—'];
        let city1 = null, city2 = null;

        for (const sep of separators) {
            if (input.toLowerCase().includes(sep)) {
                const parts = input.split(new RegExp(sep, 'i'));
                if (parts.length === 2) {
                    city1 = findCity(parts[0]);
                    city2 = findCity(parts[1]);
                    break;
                }
            }
        }

        if (!city1 || !city2) {
            const cities = [...new Set(Object.keys(DISTANCES).flatMap(k => k.split('|')))];
            city1 = findCity(input.split(/\s+/).slice(0, Math.ceil(input.split(/\s+/).length / 2)).join(' '));
            city2 = findCity(input.split(/\s+/).slice(Math.ceil(input.split(/\s+/).length / 2)).join(' '));
        }

        if (!city1 || !city2) return reply('❌ Não encontrei uma ou ambas as cidades. Verifique os nomes.');
        if (city1 === city2) return reply('❌ As duas cidades são iguais!');

        const key1 = `${city1}|${city2}`;
        const key2 = `${city2}|${city1}`;
        const km = DISTANCES[key1] || DISTANCES[key2];

        if (!km) return reply('❌ Distância não encontrada no banco de dados.');

        const hours = Math.floor(km / 80);
        const doc = [
            `╔══════════════════════════════╗`,
            `║  🗺️ *DISTÂNCIA ENTRE CIDADES* 🗺️  ║`,
            `╚══════════════════════════════╝`,
            ``,
            `📍 *Origem:* ${city1}`,
            `📍 *Destino:* ${city2}`,
            ``,
            `╭━〔 📏 RESULTADO 〕━⬣`,
            `┃ 🛣️ *Distância:* **${km.toLocaleString('pt-BR')} km**`,
            `┃ 🚗 *Tempo estimado:* ~${hours}h (via rodoviária)`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
