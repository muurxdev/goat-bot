/**
 * Comando .gerarsenha / .passgen
 * Gerador de senhas criptograficamente seguras com símbolos, números e letras
 */

const crypto = require("crypto");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "gerarsenha",
    aliases: ["passgen","password","senhasegura","novasenha","cmd_gerarsenha","alt_gerarsenha","atalho_gerarsenha","abrev_gerarsenha","call_gerarsenha","func_gerarsenha"],
    category: "dev",
    description: "Gera senhas seguras e aleatórias com tamanho configurável",
    cooldownMs: 2000,
    execute: async ({ text, reply }) => {
        const botName = getBotName();
        const len = Math.min(64, Math.max(8, parseInt(text) || 16));

        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|";
        let password = "";
        const randBytes = crypto.randomBytes(len);

        for (let i = 0; i < len; i++) {
            password += chars[randBytes[i] % chars.length];
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔑 *GERADOR DE SENHAS* 🔑   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🛡️ SENHA FORTE GERADA 〕━⬣\n`;
        doc += `┃ \`${password}\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📊 *Comprimento:* ${len} caracteres\n`;
        doc += `🔒 *Entropia:* Alta (Criptograficamente Segura)\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

