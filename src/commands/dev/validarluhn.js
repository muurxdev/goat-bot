/**
 * Comando .validarluhn — Valida se uma sequência numérica obedece ao algoritmo de Luhn (Mod 10)
 */
module.exports = {
    name: "validarluhn",
    aliases: ["checaluhn","cmd_validarluhn","alt_validarluhn","atalho_validarluhn","abrev_validarluhn","call_validarluhn","func_validarluhn"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Valida se uma sequência numérica obedece ao algoritmo de Luhn (Mod 10)",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const clean = String(text || '').replace(/\D/g, '');
            if (!clean || clean.length < 2) return reply('📌 Uso: `.validarluhn <número>`');
            let sum = 0;
            let shouldDouble = false;
            for (let i = clean.length - 1; i >= 0; i--) {
                let digit = parseInt(clean.charAt(i), 10);
                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                shouldDouble = !shouldDouble;
            }
            const isValid = sum % 10 === 0;
            return reply(isValid ? `✅ *Válido:* O número \`${clean}\` atende ao Algoritmo de Luhn (soma = ${sum}).` : `❌ *Inválido:* O número \`${clean}\` falhou no teste de Luhn (resto = ${sum % 10}).`);
        }
};
