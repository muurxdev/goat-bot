/**
 * Comando .sha512hash — Calcula o hash criptográfico SHA-512 de alta segurança
 */
module.exports = {
    name: "sha512hash",
    aliases: ["hashsha512","cmd_sha512hash","alt_sha512hash","atalho_sha512hash","abrev_sha512hash","call_sha512hash","func_sha512hash"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Calcula o hash criptográfico SHA-512 de alta segurança",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.sha512hash <texto>`');
            const crypto = require('crypto');
            const hash = crypto.createHash('sha512').update(t, 'utf8').digest('hex');
            return reply(`🔒 *HASH SHA-512*\n\n*Texto:* ${t}\n*Hash:* \`${hash}\``);
        }
};
