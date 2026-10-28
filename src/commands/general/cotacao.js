const logger = require('../../core/logger');

const RATES = {
    'USD_BRL': 5.10,
    'EUR_BRL': 5.45,
    'GBP_BRL': 6.30,
    'USD_EUR': 0.92,
    'USD_GBP': 0.79,
    'EUR_USD': 1.09,
    'EUR_GBP': 0.86,
    'GBP_USD': 1.27,
    'GBP_EUR': 1.16,
    'BRL_USD': 0.196,
    'BRL_EUR': 0.183,
    'BRL_GBP': 0.159
};

const CURRENCY_NAMES = {
    USD: 'Dólar Americano',
    EUR: 'Euro',
    GBP: 'Libra Esterlina',
    BRL: 'Real Brasileiro'
};

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    BRL: 'R$'
};

module.exports = {
    name: 'cotacao',
    aliases: ['convertermoeda', 'currency', 'moedaconversor'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Converte valores entre moedas (USD, EUR, GBP, BRL)',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.cotacao <valor> <de> <para>`\n\n' +
                '📌 *Exemplos:*\n' +
                '• `.moeda 100 USD BRL`\n' +
                '• `.moeda 50 EUR USD`\n' +
                '• `.moeda 200 BRL GBP`\n\n' +
                '💱 *Moedas suportadas:* USD, EUR, GBP, BRL'
            );
        }

        const parts = input.split(/\s+/);
        if (parts.length < 3) return reply('❌ Informe: `<valor> <moeda_origem> <moeda_destino>`.');

        const value = parseFloat(parts[0].replace(',', '.'));
        if (isNaN(value) || value < 0) return reply('❌ Valor inválido.');

        const from = parts[1].toUpperCase();
        const to = parts[2].toUpperCase();

        if (!CURRENCY_NAMES[from] || !CURRENCY_NAMES[to]) {
            return reply('❌ Moeda inválida. Use: USD, EUR, GBP ou BRL.');
        }

        if (from === to) {
            return reply(`✅ *${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${from}* já é *${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${to}*.`);
        }

        const key = `${from}_${to}`;
        const rate = RATES[key];

        if (!rate) return reply('❌ Conversão não suportada.');

        const result = value * rate;

        const doc = [
            `╔══════════════════════════════╗`,
            `║  💱 *CONVERSOR DE MOEDAS* 💱  ║`,
            `╚══════════════════════════════╝`,
            ``,
            `💰 *Valor:* ${CURRENCY_SYMBOLS[from]} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${CURRENCY_NAMES[from]})`,
            ``,
            `╭━〔 🔄 CONVERSÃO 〕━⬣`,
            `┃ 📊 *Taxa:* 1 ${from} = ${rate} ${to}`,
            `┃ 💎 *Resultado:* **${CURRENCY_SYMBOLS[to]} ${result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (${CURRENCY_NAMES[to]})`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
