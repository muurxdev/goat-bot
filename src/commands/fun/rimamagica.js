/**
 * Comando .rimamagica — Gera uma rima improvisada com uma palavra: .rimamagica <palavra>
 */
module.exports = {
    name: "rimamagica",
    aliases: ["rimamagica-cmd","cmd-rimamagica"],
    category: "fun",
    subcategory: "Humor",
    description: "Gera uma rima improvisada com uma palavra: .rimamagica <palavra>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const w = args[0] || "coração";
            return reply(`🎶 *RIMA IMPROVISADA*\n\nNa taverna ou na batalha com espada na mão,\nPara rimar com *${w}*, ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ bebe um canecão! 🍺`);
        }
};
