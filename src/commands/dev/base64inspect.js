/**
 * Comando .base64inspect — Verifica tamanho em bytes de string Base64: .base64inspect <b64>
 */
module.exports = {
    name: "base64inspect",
    aliases: ["base64inspect-cmd","cmd-base64inspect","cmd_base64inspect","alt_base64inspect","atalho_base64inspect","abrev_base64inspect","call_base64inspect","func_base64inspect"],
    category: "dev",
    subcategory: "Dev",
    description: "Verifica tamanho em bytes de string Base64: .base64inspect <b64>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const b64 = args[0] || "";
            if (!b64) return reply("Uso: `.base64inspect <base64>`");
            const buf = Buffer.from(b64, "base64");
            return reply(`📦 *Base64 Telemetria:*\n▫️ Comprimento B64: ${b64.length} chars\n▫️ Tamanho Decodificado: *${buf.length} bytes* (${(buf.length / 1024).toFixed(2)} KB)`);
        }
};
