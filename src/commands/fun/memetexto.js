/**
 * Comando .memetexto — Gera um meme em formato de texto copypasta: .memetexto
 */
module.exports = {
    name: "memetexto",
    aliases: ["memetexto-cmd","cmd-memetexto"],
    category: "fun",
    subcategory: "Humor",
    description: "Gera um meme em formato de texto copypasta: .memetexto",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🤡 *MOMENTO MEME*\n\n— Você prefere dinheiro ou sabedoria?\n— Sabedoria!\n— Eu prefiro dinheiro.\n— Cada um escolhe o que não tem! 🧠💥");
        }
};
