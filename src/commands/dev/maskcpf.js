/**
 * Comando .maskcpf — Mascara CPF ocultando dígitos centrais: .maskcpf 12345678900
 */
module.exports = {
    name: "maskcpf",
    aliases: ["maskcpf-cmd","cmd-maskcpf","cmd_maskcpf","alt_maskcpf","atalho_maskcpf","abrev_maskcpf","call_maskcpf","func_maskcpf"],
    category: "dev",
    subcategory: "Segurança",
    description: "Mascara CPF ocultando dígitos centrais: .maskcpf 12345678900",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const raw = (args[0] || "").replace(/\D/g, "");
            if (raw.length !== 11) return reply("Uso: `.maskcpf <11_digitos>`");
            const masked = `${raw.slice(0, 3)}.***.***-${raw.slice(9)}`;
            return reply(`🛡️ *CPF Mascarado:* \`${masked}\``);
        }
};
