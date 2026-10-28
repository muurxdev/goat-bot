/**
 * Comando .md5hash — Calcula a assinatura MD5 de uma string de texto
 */
module.exports = {
    name: "md5hash",
    aliases: ["hashmd5","cmd_md5hash","alt_md5hash","atalho_md5hash","abrev_md5hash","call_md5hash","func_md5hash"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Calcula a assinatura MD5 de uma string de texto",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.md5hash <texto>`');
            const crypto = require('crypto');
            const hash = crypto.createHash('md5').update(t, 'utf8').digest('hex');
            return reply(`🔒 *HASH MD5*\n\n*Texto:* ${t}\n*Hash:* \`${hash}\``);
        }
};
