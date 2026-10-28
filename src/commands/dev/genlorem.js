/**
 * Comando .genlorem — Gera parágrafo Lorem Ipsum para testes: .genlorem
 */
module.exports = {
    name: "genlorem",
    aliases: ["genlorem-cmd","cmd-genlorem","cmd_genlorem","alt_genlorem","atalho_genlorem","abrev_genlorem","call_genlorem","func_genlorem"],
    category: "dev",
    subcategory: "Dev",
    description: "Gera parágrafo Lorem Ipsum para testes: .genlorem",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            return reply("📄 *Lorem Ipsum Dolor:*\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");
        }
};
