/**
 * Comando .gerarcartao — Gera um número de cartão de crédito de teste com algoritmo de Luhn (apenas testes)
 */
module.exports = {
    name: "gerarcartao",
    aliases: ["fakecard","cmd_gerarcartao","alt_gerarcartao","atalho_gerarcartao","abrev_gerarcartao","call_gerarcartao","func_gerarcartao"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um número de cartão de crédito de teste com algoritmo de Luhn (apenas testes)",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const brands = [
                { name: 'Visa', prefix: '4' },
                { name: 'Mastercard', prefix: '5' + (Math.floor(Math.random() * 5) + 1) }
            ];
            const b = brands[Math.floor(Math.random() * brands.length)];
            const digits = b.prefix.split('').map(Number);
            while (digits.length < 15) {
                digits.push(Math.floor(Math.random() * 10));
            }
            let sum = 0;
            for (let i = 0; i < digits.length; i++) {
                let val = digits[digits.length - 1 - i];
                if (i % 2 === 0) {
                    val *= 2;
                    if (val > 9) val -= 9;
                }
                sum += val;
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            digits.push(checkDigit);
            const full = digits.join('').replace(/(\d{4})/g, '$1 ').trim();
            const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const expYear = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1);
            const cvv = String(Math.floor(Math.random() * 900) + 100);
            return reply(`💳 *CARTÃO DE TESTE (${b.name})*\n\n*Número:* \`${full}\`\n*Validade:* \`${expMonth}/${expYear}\`\n*CVV:* \`${cvv}\`\n\n⚠️ *Apenas para testes de gateways em ambiente sandbox/homologação.*`);
        }
};
