/**
 * Comando .sabedoriaking — Palavras de sabedoria do Rei das Fadas: .sabedoriaking
 */
module.exports = {
    name: "sabedoriaking",
    aliases: ["sabedoriaking-cmd","cmd-sabedoriaking"],
    category: "fun",
    subcategory: "Lore SAGA",
    description: "Palavras de sabedoria do Rei das Fadas: .sabedoriaking",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🌿 *SABEDORIA DE HARLEQUIN*\n\n\"O verdadeiro valor de um líder não está nas asas que ele possui, mas na capacidade de proteger aqueles que confiam nele com a própria vida.\"");
        }
};
