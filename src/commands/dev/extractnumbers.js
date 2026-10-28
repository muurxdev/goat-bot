/**
 * Comando .extractnumbers — Extrai todos os números de um texto: .extractnumbers <texto>
 */
module.exports = {
    name: "extractnumbers",
    aliases: ["extractnumbers-cmd","cmd-extractnumbers","cmd_extractnumbers","alt_extractnumbers","atalho_extractnumbers","abrev_extractnumbers","call_extractnumbers","func_extractnumbers"],
    category: "dev",
    subcategory: "Regex",
    description: "Extrai todos os números de um texto: .extractnumbers <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.extractnumbers <texto>`");
            const nums = t.match(/\d+/g) || [];
            return reply(`🔢 *Números extraídos (${nums.length}):*\n${nums.join(", ")}`);
        }
};
