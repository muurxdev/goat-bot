const logger = require('../../core/logger');

const BASES = {
    2: { name: 'Binário (base 2)', min: 0, max: Infinity },
    8: { name: 'Octal (base 8)', min: 0, max: Infinity },
    10: { name: 'Decimal (base 10)', min: 0, max: Infinity },
    16: { name: 'Hexadecimal (base 16)', min: 0, max: Infinity }
};

const VALID_BASES = Object.keys(BASES).map(Number);

module.exports = {
    name: 'base',
    aliases: ['baseconverter', 'numbase'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Converte números entre bases binária, octal, decimal e hexadecimal',
    cooldownMs: 3000,
    execute: async ({ args, text, reply }) => {
        const input = (text || '').trim();
        if (!input) {
            return reply(
                '❌ Uso: `.base <valor> <base_origem> <base_destino>`\n\n' +
                '📌 *Bases suportadas:* 2 (bin), 8 (oct), 10 (dec), 16 (hex)\n\n' +
                '📌 *Exemplos:*\n' +
                '• `.base 255 10 16` — 255 decimal para hexadecimal\n' +
                '• `.base FF 16 2` — FF hex para binário\n' +
                '• `.base 1010 2 10` — 1010 binário para decimal'
            );
        }

        const parts = input.split(/\s+/);
        if (parts.length < 3) return reply('❌ Informe: `<valor> <base_origem> <base_destino>`.');

        const valueStr = parts[0];
        const fromBase = parseInt(parts[1], 10);
        const toBase = parseInt(parts[2], 10);

        if (!VALID_BASES.includes(fromBase)) return reply(`❌ Base de origem inválida. Use: ${VALID_BASES.join(', ')}.`);
        if (!VALID_BASES.includes(toBase)) return reply(`❌ Base de destino inválida. Use: ${VALID_BASES.join(', ')}.`);

        let decimal;
        try {
            decimal = parseInt(valueStr, fromBase);
            if (isNaN(decimal)) throw new Error();
        } catch {
            return reply(`❌ Valor inválido para base ${fromBase}.`);
        }

        const result = decimal.toString(toBase).toUpperCase();

        const doc = [
            `╔══════════════════════════════╗`,
            `║  🔢 *CONVERSOR DE BASES* 🔢  ║`,
            `╚══════════════════════════════╝`,
            ``,
            `📝 *Valor:* ${valueStr} (${BASES[fromBase].name})`,
            ``,
            `╭━〔 🔄 RESULTADO 〕━⬣`,
            `┃ 🔟 *Decimal:* ${decimal}`,
            `┃ 0️⃣1️⃣ *Binário:* ${decimal.toString(2)}`,
            `┃ 🎱 *Octal:* ${decimal.toString(8)}`,
            `┃ 🔤 *Hexadecimal:* ${decimal.toString(16).toUpperCase()}`,
            `╰━━━━━━━━━━━━━━━━━━⬣`,
            ``,
            `🎯 *${valueStr} (${fromBase}) = ${result} (${toBase})*`
        ].join('\n');
        return reply(doc);
    }
};
