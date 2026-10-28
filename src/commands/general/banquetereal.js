/**
 * Comando .banquetereal — Serve o grande banquete do Rei Central no chat: .banquetereal
 */
module.exports = {
    name: "banquetereal",
    aliases: ["banquetereal-cmd","cmd-banquetereal"],
    category: "general",
    subcategory: "Taverna",
    description: "Serve o grande banquete do Rei Central no chat: .banquetereal",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply("🍗🥧🍷 *GRANDE BANQUETE REAL CENTRAL*\n\nMesas fartas de tortas douradas, carnes nobres assadas, frutas da floresta e jarras de hidromel servidas para todos no grupo!");
        }
};
