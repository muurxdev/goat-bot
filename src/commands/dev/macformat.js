/**
 * Comando .macformat — Formata e padroniza endereço MAC: .macformat aabbccddeeff
 */
module.exports = {
    name: "macformat",
    aliases: ["macformat-cmd","cmd-macformat","cmd_macformat","alt_macformat","atalho_macformat","abrev_macformat","call_macformat","func_macformat"],
    category: "dev",
    subcategory: "Rede",
    description: "Formata e padroniza endereço MAC: .macformat aabbccddeeff",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const raw = (args[0] || "").replace(/[^0-9a-fA-F]/g, "").toUpperCase();
            if (raw.length !== 12) return reply("Uso: `.macformat <12_digitos_hex>`");
            const colon = raw.match(/.{1,2}/g).join(":");
            const hyphen = raw.match(/.{1,2}/g).join("-");
            return reply(`💻 *Endereço MAC Formatado:*\n▫️ Padrão Linux/Unix: \`${colon}\`\n▫️ Padrão Windows: \`${hyphen}\``);
        }
};
