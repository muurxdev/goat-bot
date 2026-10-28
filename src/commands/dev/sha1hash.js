/**
 * Comando .sha1hash — Calcula o hash criptográfico SHA-1 de uma mensagem
 */
module.exports = {
    name: "sha1hash",
    aliases: ["hashsha1","cmd_sha1hash","alt_sha1hash","atalho_sha1hash","abrev_sha1hash","call_sha1hash","func_sha1hash"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Calcula o hash criptográfico SHA-1 de uma mensagem",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.sha1hash <texto>`');
            const crypto = require('crypto');
            const hash = crypto.createHash('sha1').update(t, 'utf8').digest('hex');
            return reply(`🔒 *HASH SHA-1*\n\n*Texto:* ${t}\n*Hash:* \`${hash}\``);
        }
};
