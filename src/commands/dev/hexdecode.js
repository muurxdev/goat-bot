/**
 * Comando .hexdecode — Decodifica uma sequência hexadecimal para texto
 */
module.exports = {
    name: "hexdecode",
    aliases: ["hex2texto","cmd_hexdecode","alt_hexdecode","atalho_hexdecode","abrev_hexdecode","call_hexdecode","func_hexdecode"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Decodifica uma sequência hexadecimal para texto",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').replace(/[^0-9a-fA-F]/g, '');
            if (!t || t.length % 2 !== 0) return reply('📌 Uso: `.hexdecode <hex>` (informe pares hexadecimais válidos)');
            try {
                const str = Buffer.from(t, 'hex').toString('utf8');
                return reply(`🔤 *TEXTO DECODIFICADO:*\n\n${str}`);
            } catch (e) {
                return reply('❌ Falha ao decodificar hexadecimal.');
            }
        }
};
