/**
 * Comando .invocacaocoop — Conjura um círculo mágico cooperativo de dois magos: .invocacaocoop
 */
module.exports = {
    name: "invocacaocoop",
    aliases: ["invocacaocoop-cmd","cmd-invocacaocoop"],
    category: "general",
    subcategory: "Magia",
    description: "Conjura um círculo mágico cooperativo de dois magos: .invocacaocoop",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply("🌀 *CÍRCULO MÁGICO DUPLO*\n\nDois guerreiros uniram suas mãos no centro da estrela! Uma barreira gigantesca envolveu toda a taverna!");
        }
};
