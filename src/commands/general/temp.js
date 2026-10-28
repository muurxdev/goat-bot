const logger = require('../../core/logger');

function celsiusToFahrenheit(c) { return (c * 9 / 5) + 32; }
function celsiusToKelvin(c) { return c + 273.15; }
function fahrenheitToCelsius(f) { return (f - 32) * 5 / 9; }
function kelvinToCelsius(k) { return k - 273.15; }

function convert(value, from) {
    let celsius;
    switch (from.toUpperCase()) {
        case 'C': celsius = value; break;
        case 'F': celsius = fahrenheitToCelsius(value); break;
        case 'K': celsius = kelvinToCelsius(value); break;
        default: return null;
    }
    return {
        C: Number(celsius.toFixed(2)),
        F: Number(celsiusToFahrenheit(celsius).toFixed(2)),
        K: Number(celsiusToKelvin(celsius).toFixed(2))
    };
}

const UNIT_NAMES = { C: 'Celsius (°C)', F: 'Fahrenheit (°F)', K: 'Kelvin (K)' };
const UNIT_EMOJI = { C: '🌡️', F: '🔥', K: '❄️' };

module.exports = {
    name: 'temp',
    aliases: ['convertertemp', 'temperaturaconvert'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Converte temperaturas entre Celsius, Fahrenheit e Kelvin',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.temp <valor> <unidade>`\n\n' +
                '📌 *Unidades:* C (Celsius), F (Fahrenheit), K (Kelvin)\n\n' +
                '📌 *Exemplo:* `.temp 100 F` — converte 100°F para as outras escalas'
            );
        }

        const parts = input.split(/\s+/);
        if (parts.length < 2) return reply('❌ Informe o valor e a unidade.');

        const value = parseFloat(parts[0].replace(',', '.'));
        const unit = parts[1].toUpperCase();

        if (isNaN(value)) return reply('❌ Valor inválido.');
        if (!['C', 'F', 'K'].includes(unit)) return reply('❌ Unidade inválida. Use C, F ou K.');

        const result = convert(value, unit);
        if (!result) return reply('❌ Erro na conversão.');

        const doc = [
            `╔══════════════════════════════╗`,
            `║  🌡️ *CONVERSOR DE TEMPERATURA* 🌡️  ║`,
            `╚══════════════════════════════╝`,
            ``,
            `${UNIT_EMOJI[unit]} *Valor:* ${value}° ${UNIT_NAMES[unit]}`,
            ``,
            `╭━〔 🔄 RESULTADO 〕━⬣`,
            `┃ 🌡️ *Celsius:* ${result.C}°C`,
            `┃ 🔥 *Fahrenheit:* ${result.F}°F`,
            `┃ ❄️ *Kelvin:* ${result.K} K`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
