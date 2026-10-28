const logger = require('../../core/logger');

function kgToG(kg) { return kg * 1000; }
function kgToLb(kg) { return kg * 2.20462; }
function kgToOz(kg) { return kg * 35.274; }

function toKg(value, unit) {
    switch (unit.toLowerCase()) {
        case 'kg': return value;
        case 'g': return value / 1000;
        case 'lb': return value / 2.20462;
        case 'oz': return value / 35.274;
        default: return null;
    }
}

const UNIT_NAMES = { kg: 'Quilogramas', g: 'Gramas', lb: 'Libras', oz: 'Onças' };
const UNIT_EMOJI = { kg: '⚖️', g: '🪶', lb: '🏋️', oz: '🥄' };

module.exports = {
    name: 'peso',
    aliases: ['pesoconverter', 'massa', 'weigh'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Converte pesos entre kg, g, lb e oz',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.peso <valor> <unidade>`\n\n' +
                '📌 *Unidades:* kg, g, lb (libras), oz (onças)\n\n' +
                '📌 *Exemplo:* `.peso 70 kg` — converte 70kg para as outras unidades'
            );
        }

        const parts = input.split(/\s+/);
        if (parts.length < 2) return reply('❌ Informe o valor e a unidade.');

        const value = parseFloat(parts[0].replace(',', '.'));
        const unit = parts[1].toLowerCase();

        if (isNaN(value) || value < 0) return reply('❌ Valor inválido.');
        if (!['kg', 'g', 'lb', 'oz'].includes(unit)) return reply('❌ Unidade inválida. Use: kg, g, lb, oz.');

        const kg = toKg(value, unit);
        if (kg === null) return reply('❌ Erro na conversão.');

        const doc = [
            `╔══════════════════════════════╗`,
            `║  ⚖️ *CONVERSOR DE PESO* ⚖️   ║`,
            `╚══════════════════════════════╝`,
            ``,
            `${UNIT_EMOJI[unit]} *Valor:* ${value} ${unit} (${UNIT_NAMES[unit]})`,
            ``,
            `╭━〔 🔄 RESULTADO 〕━⬣`,
            `┃ ⚖️ *Quilogramas:* ${kg.toFixed(4)} kg`,
            `┃ 🪶 *Gramas:* ${kgToG(kg).toFixed(2)} g`,
            `┃ 🏋️ *Libras:* ${kgToLb(kg).toFixed(4)} lb`,
            `┃ 🥄 *Onças:* ${kgToOz(kg).toFixed(4)} oz`,
            `╰━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n');
        return reply(doc);
    }
};
